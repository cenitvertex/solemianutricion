import React from 'react';
import { Check } from 'lucide-react';

export default function PricingCard({
    title,
    price,
    period,
    features,
    isPopular,
    highlight,
    buttonText,
    onAction
}) {
    return (
        <div className={`card-premium pricing-card ${isPopular ? 'popular animate-premium' : ''}`}>
            {isPopular && <div className="pricing-badge">Recomendado</div>}

            <div className="pricing-header">
                <h3 className="pricing-title" style={{ color: isPopular ? 'var(--solemia-pink)' : 'var(--solemia-plum)' }}>
                    {title}
                </h3>
                <div className="pricing-price-container">
                    <span className="pricing-price">{price}</span>
                    <span className="pricing-period">{period}</span>
                </div>
                {highlight && <p className="pricing-highlight">{highlight}</p>}
            </div>

            <ul className="pricing-features">
                {features.map((feature, idx) => (
                    <li key={idx} className="pricing-feature">
                        <Check size={16} color="var(--solemia-emerald)" strokeWidth={3} />
                        {feature}
                    </li>
                ))}
            </ul>

            <button
                onClick={onAction}
                className={`btn ${isPopular ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%', padding: '1.25rem' }}
            >
                {buttonText}
            </button>
        </div>
    );
}
