import { createHash } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SettingsService } from 'src/settings/providers/settings.service';

type BbbRole = 'MODERATOR' | 'VIEWER';

type CreateMeetingInput = {
  meetingID: string;
  name: string;
  attendeePW: string;
  moderatorPW: string;
  record?: boolean;
  welcome?: string | null;
};

type JoinMeetingInput = {
  meetingID: string;
  fullName: string;
  role: BbbRole;
  password: string;
  userID?: string;
};

export type BbbRecording = {
  recordID: string;
  meetingID: string | null;
  name: string | null;
  state: string | null;
  published: boolean;
  startTime: Date | null;
  endTime: Date | null;
  participants: number | null;
  playback: {
    type: string;
    url: string;
    lengthSeconds: number | null;
  } | null;
};

@Injectable()
export class BigBlueButtonProvider {
  constructor(private readonly settingsService: SettingsService) {}

  async createMeeting(input: CreateMeetingInput) {
    const settings = await this.getRuntimeSettings();
    const params: Record<string, string | number | boolean> = {
      name: input.name,
      meetingID: input.meetingID,
      attendeePW: input.attendeePW,
      moderatorPW: input.moderatorPW,
      record: input.record ?? settings.defaultRecord,
      autoStartRecording: settings.autoStartRecording,
      allowStartStopRecording: settings.allowStartStopRecording,
      allowRequestsWithoutSession: true,
      meetingExpireIfNoUserJoinedInMinutes:
        settings.meetingExpireIfNoUserJoinedInMinutes,
    };

    if (input.welcome) {
      params.welcome = input.welcome;
    }

    const url = this.buildApiUrl(
      settings.apiUrl,
      'create',
      params,
      settings.sharedSecret,
    );
    const response = await fetch(url);
    const xml = await response.text();
    const parsed = this.parseBbbResponse(xml);

    if (!response.ok || parsed.returncode !== 'SUCCESS') {
      throw new BadRequestException(
        parsed.message || 'BigBlueButton meeting could not be created',
      );
    }

    return parsed;
  }

  async getJoinUrl(input: JoinMeetingInput) {
    const settings = await this.getRuntimeSettings();

    return this.buildApiUrl(
      settings.apiUrl,
      'join',
      {
        meetingID: input.meetingID,
        fullName: input.fullName,
        role: input.role,
        password: input.password,
        ...(input.userID ? { userID: input.userID } : {}),
      },
      settings.sharedSecret,
    );
  }

  async getMeetingInfo(meetingID: string, moderatorPW: string) {
    const settings = await this.getRuntimeSettings();
    const url = this.buildApiUrl(
      settings.apiUrl,
      'getMeetingInfo',
      {
        meetingID,
        password: moderatorPW,
      },
      settings.sharedSecret,
    );
    const response = await fetch(url);
    const xml = await response.text();
    const parsed = this.parseBbbResponse(xml);

    if (parsed.messageKey === 'notFound') {
      return {
        isRunning: false,
        participantCount: 0,
        moderatorCount: 0,
      };
    }

    if (!response.ok || parsed.returncode !== 'SUCCESS') {
      throw new BadRequestException(
        parsed.message || 'BigBlueButton meeting status could not be checked',
      );
    }

    return {
      isRunning: this.getXmlValue(xml, 'running') !== 'false',
      participantCount: this.toNumber(this.getXmlValue(xml, 'participantCount')) ?? 0,
      moderatorCount: this.toNumber(this.getXmlValue(xml, 'moderatorCount')) ?? 0,
    };
  }

  async getRecordings(meetingID: string) {
    const settings = await this.getRuntimeSettings();
    const url = this.buildApiUrl(
      settings.apiUrl,
      'getRecordings',
      {
        meetingID,
        state: 'any',
      },
      settings.sharedSecret,
    );
    const response = await fetch(url);
    const xml = await response.text();
    const parsed = this.parseBbbResponse(xml);

    if (!response.ok || parsed.returncode !== 'SUCCESS') {
      throw new BadRequestException(
        parsed.message || 'BigBlueButton recordings could not be fetched',
      );
    }

    return this.parseRecordings(xml);
  }

  private async getRuntimeSettings() {
    const settings = await this.settingsService.getBbbSettingsForRuntime();

    if (!settings.isEnabled || !settings.apiUrl || !settings.sharedSecret) {
      throw new BadRequestException(
        'BigBlueButton is not configured. Please update live class settings.',
      );
    }

    return settings;
  }

  private buildApiUrl(
    apiUrl: string,
    method: string,
    params: Record<string, string | number | boolean>,
    sharedSecret: string,
  ) {
    const baseUrl = this.normalizeApiUrl(apiUrl);
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      query.append(key, String(value));
    }

    const queryString = query.toString();
    const checksum = createHash('sha1')
      .update(`${method}${queryString}${sharedSecret}`)
      .digest('hex');

    return `${baseUrl}/${method}?${queryString}&checksum=${checksum}`;
  }

  private normalizeApiUrl(value: string) {
    const trimmed = value.trim().replace(/\/+$/, '');

    if (trimmed.endsWith('/bigbluebutton/api')) {
      return trimmed;
    }

    if (trimmed.endsWith('/bigbluebutton')) {
      return `${trimmed}/api`;
    }

    return `${trimmed}/bigbluebutton/api`;
  }

  private parseBbbResponse(xml: string) {
    const getValue = (tag: string) => {
      const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return match?.[1] || null;
    };

    return {
      returncode: getValue('returncode'),
      message: getValue('message'),
      messageKey: getValue('messageKey'),
      meetingID: getValue('meetingID'),
      createTime: getValue('createTime'),
      url: this.decodeXml(getValue('url')),
    };
  }

  private parseRecordings(xml: string): BbbRecording[] {
    const recordingBlocks = [
      ...xml.matchAll(/<recording>([\s\S]*?)<\/recording>/g),
    ];

    return recordingBlocks
      .map((block) => this.parseRecordingBlock(block[1]))
      .filter((recording): recording is BbbRecording => Boolean(recording));
  }

  private parseRecordingBlock(xml: string): BbbRecording | null {
    const recordID = this.getXmlValue(xml, 'recordID');

    if (!recordID) return null;

    const startTime = this.toBbbDate(this.getXmlValue(xml, 'startTime'));
    const endTime = this.toBbbDate(this.getXmlValue(xml, 'endTime'));
    const playback = this.parsePlayback(xml);

    return {
      recordID,
      meetingID: this.getXmlValue(xml, 'meetingID'),
      name: this.decodeXml(this.getXmlValue(xml, 'name')),
      state: this.getXmlValue(xml, 'state'),
      published: this.getXmlValue(xml, 'published') === 'true',
      startTime,
      endTime,
      participants: this.toNumber(this.getXmlValue(xml, 'participants')),
      playback,
    };
  }

  private parsePlayback(xml: string): BbbRecording['playback'] {
    const formatBlocks = [...xml.matchAll(/<format>([\s\S]*?)<\/format>/g)];
    const preferred =
      formatBlocks.find(
        (block) => this.getXmlValue(block[1], 'type') === 'video',
      ) ??
      formatBlocks.find(
        (block) => this.getXmlValue(block[1], 'type') === 'podcast',
      ) ??
      formatBlocks.find(
        (block) => this.getXmlValue(block[1], 'type') === 'presentation',
      ) ??
      formatBlocks[0];

    if (!preferred) return null;

    const type = this.getXmlValue(preferred[1], 'type') || 'presentation';
    const url = this.getXmlValue(preferred[1], 'url');

    if (!url) return null;

    return {
      type,
      url: this.decodeXml(url) ?? url,
      lengthSeconds: this.toNumber(this.getXmlValue(preferred[1], 'length')),
    };
  }

  private getXmlValue(xml: string, tag: string) {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    return match?.[1]?.trim() || null;
  }

  private toBbbDate(value: string | null) {
    const timestamp = this.toNumber(value);
    return timestamp ? new Date(timestamp) : null;
  }

  private toNumber(value: string | null) {
    if (!value) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private decodeXml(value: string | null) {
    if (!value) return value;

    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}
