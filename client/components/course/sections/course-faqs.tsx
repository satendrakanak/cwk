import { CourseFaqItem } from "@/types/course";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CourseFaqsProps {
  faqs?: CourseFaqItem[];
}

export function CourseFaqs({ faqs = [] }: CourseFaqsProps) {
  return (
    <section className="academy-card p-5 md:p-6">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="mt-2 text-xl font-semibold text-card-foreground">
          Course FAQs
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Clear answers to the practical doubts learners usually have about this
          program.
        </p>
      </div>

      {faqs.length ? (
        <Accordion
          type="single"
          collapsible
          className="space-y-3"
          defaultValue="faq-0"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={`${faq.question}-${index}`}
              value={`faq-${index}`}
              className="overflow-hidden rounded-2xl border border-border bg-muted/50 px-5 transition-colors duration-300 hover:border-primary/25 hover:bg-primary/5"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-card-foreground hover:no-underline [&>svg]:text-primary">
                <span className="pr-4 leading-7">{faq.question}</span>
              </AccordionTrigger>

              <AccordionContent className="pb-5">
                <div className="border-t border-border pt-4 text-sm leading-7 text-muted-foreground">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
          <p className="text-sm font-semibold text-card-foreground">
            No FAQs added yet
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            FAQs will appear here once the admin adds them for this course.
          </p>
        </div>
      )}
    </section>
  );
}
