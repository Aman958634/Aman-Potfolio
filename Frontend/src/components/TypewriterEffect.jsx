import { useEffect, useState } from 'react';

const TypewriterEffect = () => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);

  const phrases = [
    'Full Stack Developer',
    'UI/UX Designer',
    'Problem Solver',
    'Tech Enthusiast',
  ];

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 100;
    const timer = setTimeout(() => {
      const phrase = phrases[currentPhrase];
      let newText = displayText;

      if (!isDeleting) {
        newText = phrase.substring(0, currentIndex + 1);
        setDisplayText(newText);

        if (newText === phrase) {
          setTimeout(() => setIsDeleting(true), 2000);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      } else {
        newText = phrase.substring(0, currentIndex - 1);
        setDisplayText(newText);

        if (newText === '') {
          setIsDeleting(false);
          setCurrentPhrase((currentPhrase + 1) % phrases.length);
          setCurrentIndex(0);
        } else {
          setCurrentIndex(currentIndex - 1);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentIndex, currentPhrase]);

  return (
    <h2 className="heading-md text-slate-950">
      {displayText}
      <span className="animate-pulse text-slate-950">|</span>
    </h2>
  );
};

export default TypewriterEffect;
