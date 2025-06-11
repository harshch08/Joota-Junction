import React from 'react';

const AnnouncementBar: React.FC = () => {
  const announcements = [
    "Pay ₹200 advance for cash on delivery orders!",
    "Our team will contact you for order confirmation!"
  ];

  return (
    <div className="w-full bg-black text-white py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap inline-block">
        {[...Array(6)].map((_, index) => (
          <span key={index} className="inline-block">
            <span className="mx-4">{announcements[index % 2]}</span>
            <span className="mx-4">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar; 