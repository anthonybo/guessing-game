import React, { useEffect } from 'react';
import '../styles/header.scss';

const Header = () => {
  useEffect(() => {
    const header = document.querySelector('.header');
    const text = header.textContent;
    const letters = text.split('');

    header.innerHTML = letters
      .map((letter, index) => `<span class="letter" style="animation-delay: ${index * 0.1}s">${letter}</span>`)
      .join('');

    const letterElements = document.querySelectorAll('.letter');
    const fontSize = parseFloat(window.getComputedStyle(header).fontSize);

    const resizeText = () => {
      const headerWidth = header.offsetWidth;
      const containerWidth = header.parentNode.offsetWidth;
      const scaleFactor = containerWidth / headerWidth;
      const newFontSize = fontSize * scaleFactor;

      header.style.fontSize = `${newFontSize}px`;
    };

    resizeText();
    window.addEventListener('resize', resizeText);

    return () => {
      window.removeEventListener('resize', resizeText);
    };
  }, []);

  return (
    <header className="header">
      <h1>Guess That Metric</h1>
    </header>
  );
};

export default Header;
