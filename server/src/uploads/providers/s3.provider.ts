import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { SettingsService } from 'src/settings/providers/settings.service';

type AwsRuntimeSettings = {
  isEnabled: boolean;
  region: string;
  bucketName: string;
  cloudfrontUrl: string;
  accessKeyId: string;
  accessKeySecret: string;
};

@Injectable()
export class S3Provider implements OnModuleInit {
  private client: S3Client | null = null;
  private config: AwsRuntimeSettings;

  constructor(
    private readonly settingsService: SettingsService,
  ) {
    this.config = this.getEnvFallback();
  }

  async onModuleInit() {
    await this.refreshRuntimeConfig();
  }

  async refreshRuntimeConfig() {
    const nextConfig = await this.settingsService
      .getAwsStorageSettingsForRuntime()
      .catch(() => this.getEnvFallback());

    this.config = {
      ...this.getEnvFallback(),
      ...nextConfig,
    };
    this.client = this.hasClientConfig(this.config)
      ? this.buildClient(this.config)
      : null;
  }

  async getClient(): Promise<S3Client> {
    await this.refreshRuntimeConfig();
    if (!this.client) {
      throw new Error(
        'AWS storage is not configured. Please save AWS storage settings before using media uploads.',
      );
    }
    return this.client;
  }

  async getBucket(): Promise<string> {
    await this.refreshRuntimeConfig();
    if (!this.config.bucketName) {
      throw new Error(
        'AWS storage bucket is not configured. Please save AWS storage settings before using media uploads.',
      );
    }
    return this.config.bucketName;
  }

  getRegion(): string {
    return this.config.region;
  }

  getCloudFrontUrl(): string {
    return this.config.cloudfrontUrl;
  }

  private buildClient(config: AwsRuntimeSettings) {
    return new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.accessKeySecret,
      },
    });
  }

  private hasClientConfig(config: AwsRuntimeSettings) {
    return Boolean(
      config.region && config.accessKeyId && config.accessKeySecret,
    );
  }

  private getEnvFallback(): AwsRuntimeSettings {
    return {
      isEnabled: false,
      region: '',
      bucketName: '',
      cloudfrontUrl: '',
      accessKeyId: '',
      accessKeySecret: '',
    };
  }
}
