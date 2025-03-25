import { useState } from 'react';
import './QuoteDisplay.css';

const QuoteDisplay = () => {
  // Collection of quotes that take approximately 10 seconds to say
  const quotes = [
    "The future belongs to those who believe in the beauty of their dreams. What we achieve inwardly will change outer reality. It is during our darkest moments that we must focus to see the light.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "The way to get started is to quit talking and begin doing. Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking.",
    "In the end, we will remember not the words of our enemies, but the silence of our friends. The ultimate measure of a person is not where they stand in moments of comfort and convenience, but where they stand at times of challenge and controversy.",
    "It is not the critic who counts; not the one who points out how the strong person stumbles, or where the doer of deeds could have done them better. The credit belongs to the one who is actually in the arena.",
    "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will. If you cannot fly then run, if you cannot run then walk, if you cannot walk then crawl, but whatever you do you have to keep moving forward.",
    "Life is what happens when you're busy making other plans. Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do. So throw off the bowlines, sail away from safe harbor, and catch the trade winds in your sails.",
    "Education is the most powerful weapon which you can use to change the world. The function of education is to teach one to think intensively and to think critically. Intelligence plus character - that is the goal of true education.",
    "The only thing we have to fear is fear itself. Ask not what your country can do for you – ask what you can do for your country. We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard.",
    "Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that. Our lives begin to end the day we become silent about things that matter."
  ];

  const [currentQuote, setCurrentQuote] = useState(() => {
    // Initialize with a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  });

  const getNewQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (quotes[newIndex] === currentQuote && quotes.length > 1);
    
    setCurrentQuote(quotes[newIndex]);
  };

  return (
    <div className="quote-display flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-gray-800 text-gray-100">
      <h3 className="text-xl font-semibold mb-4">10-Second Quote</h3>
      <div className="quote-content text-center mb-4">
        <blockquote className="italic">"{currentQuote}"</blockquote>
      </div>
      <button onClick={getNewQuote} className="new-quote-button bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
        Get New Quote
      </button>
    </div>
  );
};

export default QuoteDisplay;