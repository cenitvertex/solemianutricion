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
        <div className={`card-premium ${isPopular ? 'animate-premium' : ''}`} style={{
            position: 'relative',
            border: isPopular ? '2px solid var(--solemia-pink)' : '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '3rem 2.5rem'
        }}>
            {isPopular && (
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--solemia-gradient)',
                    color: 'white',
                    padding: '4px 16px',
                    borderRadius: '100px',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Recomendado
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: isPopular ? 'var(--solemia-pink)' : 'var(--solemia-plum)' }}>
                    {title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--solemia-plum)' }}>{price}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{period}</span>
                </div>
                {highlight && (
                    <p style={{ color: 'var(--solemia-emerald)', fontSize: '0.85rem', fontWeight: '700', marginTop: '0.5rem' }}>
                        {highlight}
                    </p>
                )}
            </div>

            <ul style={{ listStyle: 'none', marginBottom: '2.5rem', flex: 1 }}>
                {features.map((feature, idx) => (
                    <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        color: 'var(--solemia-charcoal)'
                    }}>
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
