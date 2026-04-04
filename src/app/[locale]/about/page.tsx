import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getTenant, getTenantConfig } from "@/lib/tenant/config";
import {
  MotionDiv,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { Heart, Target, Eye, Shield } from "lucide-react";

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations();
  const isAr = locale === "ar";
  const tenant = await getTenant();
  const config = await getTenantConfig();

  let pageTitle: string | null = null;
  let pageContent: string | null = null;

  if (tenant) {
    const supabase = await createClient();
    const { data: page } = await supabase
      .from("pages")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("slug", "about")
      .eq("is_published", true)
      .single();

    if (page) {
      pageTitle = isAr ? page.title_ar : page.title_en;
      pageContent = isAr ? page.content_ar : page.content_en;
    }
  }

  const companyName = isAr ? config.company_name_ar : config.company_name_en;
  const footerAbout = isAr ? config.footer_about_ar : config.footer_about_en;

  return (
    <div>
      {/* ─── Page Header ─── */}
      <section className="relative overflow-hidden pt-36 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.03] via-brand-secondary/[0.02] to-transparent" />
        <div className="absolute -top-40 -start-40 h-80 w-80 rounded-full bg-brand-primary/[0.04] blur-[100px]" />
        <div className="absolute -bottom-20 -end-20 h-60 w-60 rounded-full bg-brand-secondary/[0.04] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <MotionDiv variant="fade-up">
            <span className="section-label">
              {t("common.about")}
            </span>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.1}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              {pageTitle || t("page.aboutUs")}
            </h1>
          </MotionDiv>
          <MotionDiv variant="fade-up" delay={0.15}>
            <div className="ornament mx-auto mt-6">
              <span className="diamond" />
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <MotionDiv variant="fade-up" delay={0.2}>
          {pageContent ? (
            <div
              className="prose prose-lg prose-elegant mx-auto max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: pageContent }}
            />
          ) : (
            <div className="text-center">
              <h2 className="mb-5 text-3xl font-bold tracking-tight">
                {companyName}
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-[1.9] text-muted-foreground">
                {footerAbout ||
                  (isAr
                    ? `مرحباً بكم في ${companyName}. نحن نقدم أفضل الرحلات السياحية والعروض المميزة لعملائنا الكرام.`
                    : `Welcome to ${companyName}. We offer the best travel packages and exclusive deals for our valued customers.`)}
              </p>
            </div>
          )}
        </MotionDiv>
      </section>

      {/* ─── Our Values ─── Rich fallback section */}
      {!pageContent && (
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.02] to-transparent" />
          <div className="relative mx-auto max-w-7xl px-6">
            <MotionDiv variant="fade-up" className="mb-5 text-center">
              <span className="section-label">
                {isAr ? "قيمنا" : "Our Values"}
              </span>
            </MotionDiv>
            <MotionDiv variant="fade-up" delay={0.1} className="mb-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {isAr
                  ? "ما يميزنا عن الآخرين"
                  : "What Sets Us Apart"}
              </h2>
            </MotionDiv>
            <MotionDiv variant="fade-up" delay={0.15} className="mb-16 text-center">
              <div className="ornament mx-auto">
                <span className="diamond" />
              </div>
            </MotionDiv>

            <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {[
                {
                  icon: Target,
                  title: isAr ? "رؤيتنا" : "Our Vision",
                  desc: isAr
                    ? "أن نكون الخيار الأول للمسافرين الباحثين عن تجارب سفر استثنائية وفريدة تتجاوز توقعاتهم"
                    : "To be the first choice for travelers seeking exceptional and unique travel experiences that exceed expectations",
                },
                {
                  icon: Heart,
                  title: isAr ? "مهمتنا" : "Our Mission",
                  desc: isAr
                    ? "تقديم خدمات سفر متكاملة بأعلى معايير الجودة والاحترافية مع ضمان رضا عملائنا في كل رحلة"
                    : "Delivering comprehensive travel services with the highest standards of quality and professionalism",
                },
                {
                  icon: Eye,
                  title: isAr ? "الاهتمام بالتفاصيل" : "Attention to Detail",
                  desc: isAr
                    ? "نحرص على كل تفصيلة صغيرة في رحلاتكم من لحظة التخطيط وحتى العودة لضمان تجربة لا تُنسى"
                    : "We care about every small detail of your journey from planning to return, ensuring an unforgettable experience",
                },
                {
                  icon: Shield,
                  title: isAr ? "الثقة والأمان" : "Trust & Safety",
                  desc: isAr
                    ? "نلتزم بأعلى معايير الأمان والشفافية في جميع تعاملاتنا لنكون شريككم الموثوق في السفر"
                    : "We uphold the highest standards of safety and transparency to be your trusted travel partner",
                },
              ].map((value) => (
                <StaggerItem key={value.title}>
                  <div className="card-shine group flex h-full gap-5 rounded-2xl border border-border/40 bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/[0.04]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 transition-all group-hover:from-brand-primary/15 group-hover:to-brand-secondary/15">
                      <value.icon className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold tracking-tight">
                        {value.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {value.desc}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}
    </div>
  );
}
