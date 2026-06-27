'use client';

import { ANALYTICS } from '@/lib/seoConfig';
import Script from 'next/script';

/**
 * Analytics & tracking scripts — only loaded when the corresponding
 * environment variable is set. This component is rendered in the root
 * layout <body> so scripts load on every page.
 */
export default function AnalyticsScripts() {
  return (
    <>
      {/* ── Google Analytics 4 ─────────────────────────────── */}
      {ANALYTICS.ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ANALYTICS.ga4Id}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* ── Google Tag Manager ─────────────────────────────── */}
      {ANALYTICS.gtmId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${ANALYTICS.gtmId}');
          `}
        </Script>
      )}

      {/* ── Microsoft Clarity ──────────────────────────────── */}
      {ANALYTICS.clarityId && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${ANALYTICS.clarityId}");
          `}
        </Script>
      )}

      {/* ── Meta Pixel (Facebook) ──────────────────────────── */}
      {ANALYTICS.metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${ANALYTICS.metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
