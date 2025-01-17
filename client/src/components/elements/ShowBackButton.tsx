import React, { useEffect, useState } from "react";

const BackButtonPage: React.FC = () => {
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    // Check if the user has a referrer (came from another page)
    if (document.referrer && document.referrer !== window.location.href) {
      setShowBackButton(true); // Show back button
    }
  }, []);

  const handleBackClick = () => {
    // Go back to the previous page
    window.history.back();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to the Current Page</h1>
      {showBackButton ? (
        <button
          onClick={handleBackClick}
          style={{ padding: "10px", marginTop: "20px" }}
        >
          Go Back to Previous Page
        </button>
      ) : (
        <p>You came directly to this page. No back navigation available.</p>
      )}
    </div>
  );
};

export default BackButtonPage;
