import React from 'react';

const ErrorFallback: React.FC = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Something went wrong.</h1>
            <p>Please try again later.</p>
        </div>
    );
};

export default ErrorFallback;
