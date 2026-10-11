import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function NotFound(): ReactNode {
  return (
    <Layout
      title="Page Not Found"
      description="The requested page could not be found in JFR Performance Lab documentation."
    >
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <main className="container margin-vert--xl" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }} aria-hidden="true">🔍</div>
          <Heading as="h1" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Page Not Found
          </Heading>
          <p style={{ fontSize: '1.2rem', color: 'var(--ifm-color-content-secondary)', marginBottom: '2rem' }}>
            We could not find the recording or page you were looking for. It may have been moved or renamed in a recent update.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="button button--primary button--lg" to="/">
              Return Home
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/getting-started/quickstart">
              Getting Started
            </Link>
            <Link className="button button--outline button--secondary button--lg" to="/docs/scenarios/overview">
              Demo Scenarios
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
