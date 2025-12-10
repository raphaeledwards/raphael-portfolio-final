import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
    // Default values if not provided
    const siteTitle = "Raphael J. Edwards | Technology Executive & Services Architect";
    const siteDescription = "Portfolio of Raphael J. Edwards, a Boston-based Technology Executive and Services Architect specializing in building resilient teams and solving complex problems.";
    const siteKeywords = "Raphael J. Edwards, Technology Executive, Services Architect, Boston, Cybersecurity, Cloud Computing, Digital Transformation, Engineering Leadership";
    const siteUrl = "https://raphaeljedwards.com";
    const siteImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop";

    // Computed values
    const metaTitle = title ? `${title} | Raphael J. Edwards` : siteTitle;
    const metaDescription = description || siteDescription;
    const metaKeywords = keywords || siteKeywords;
    const metaImage = image || siteImage;
    const metaUrl = url || siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={metaTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
