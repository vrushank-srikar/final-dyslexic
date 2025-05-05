// // import React, { useState, useEffect, useRef } from 'react';
// // import axios from 'axios';
// // import '../styles/game.css';
// // import videoFile from '../assets/video.mp4';
// // import dogImage from '../assets/dog.png';
// // import catImage from '../assets/cat.png';
// // import tigerImage from '../assets/tiger.png';
// // import zebraImage from '../assets/zebra.png';
// // import monkeyImage from '../assets/monkey.png';
// // import horseImage from '../assets/horse.png';
// // import useEmotionDetection from './EmotionDetection/useEmotionDetection';

// // const Game = () => {
// //   const [gameStarted, setGameStarted] = useState(false);
// //   const [gameCompleted, setGameCompleted] = useState(false);
// //   const [wordIndex, setWordIndex] = useState(0);
// //   const [shuffledWords, setShuffledWords] = useState([]);
// //   const [currentWord, setCurrentWord] = useState(null);
// //   const [letters, setLetters] = useState([]);
// //   const [dropZones, setDropZones] = useState([]);
// //   const [score, setScore] = useState(0);
// //   const [feedback, setFeedback] = useState(null);
// //   const [currentEmotion, setCurrentEmotion] = useState(null);
// //   const [questionEmotions, setQuestionEmotions] = useState([]);

// //   const videoRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const emotionDisplayRef = useRef(null);

// //   const emotionColors = {
// //     happy: 'rgba(255, 215, 0, 0.5)',    // Gold
// //     sad: 'rgba(135, 206, 235, 0.5)',   // Sky Blue
// //     angry: 'rgba(255, 69, 0, 0.5)',     // Orange Red
// //     surprise: 'rgba(152, 251, 152, 0.5)', // Pale Green
// //     fear: 'rgba(221, 160, 221, 0.5)',   // Plum
// //     disgust: 'rgba(176, 196, 222, 0.5)', // Light Steel Blue
// //     neutral: 'rgba(245, 245, 245, 0.5)', // Whitesmoke
// //   };

// //   const handleEmotionsCollected = (emotions) => {
// //     setQuestionEmotions(emotions);
// //     const emotionCounts = emotions.reduce((acc, emotion) => {
// //       acc[emotion] = (acc[emotion] || 0) + 1;
// //       return acc;
// //     }, {});
// //     const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
// //       emotionCounts[a] > emotionCounts[b] ? a : b
// //     );
// //     setCurrentEmotion(dominantEmotion.toLowerCase());

// //     const userId = localStorage.getItem('userId');
// //     if (!userId || !currentWord) return;

// //     axios.post('http://localhost:3000/child/save-emotion', {
// //       userId,
// //       emotion: dominantEmotion.toLowerCase(),
// //       question: currentWord.correct,
// //     }, {
// //       headers: { Authorization: `Bearer ${localStorage.getItem('child_token')}` },
// //     })
// //       .then(res => console.log('Emotion saved:', res.data))
// //       .catch(error => console.error('Error saving emotion:', error));
// //   };

// //   useEmotionDetection(videoRef, canvasRef, emotionDisplayRef, gameStarted, handleEmotionsCollected);

// //   const words = [
// //     { correct: 'dog', jumbled: 'gdo', image: dogImage },
// //     { correct: 'cat', jumbled: 'tac', image: catImage },
// //     { correct: 'tiger', jumbled: 'ietgr', image: tigerImage },
// //     { correct: 'zebra', jumbled: 'abezr', image: zebraImage },
// //     { correct: 'monkey', jumbled: 'mkyoen', image: monkeyImage },
// //     { correct: 'horse', jumbled: 'soehr', image: horseImage },
// //   ];

// //   useEffect(() => {
// //     setShuffledWords([...words].sort(() => Math.random() - 0.5));
// //   }, []);

// //   useEffect(() => {
// //     if (shuffledWords.length > 0) {
// //       const word = shuffledWords[wordIndex];
// //       setCurrentWord(word);
// //       setLetters(word.jumbled.split(''));
// //       setDropZones(Array(word.correct.length).fill(null));
// //       setQuestionEmotions([]);
// //     }
// //   }, [wordIndex, shuffledWords]);

// //   const handleDragStart = (e, letter) => {
// //     e.dataTransfer.setData('text/plain', letter);
// //   };

// //   const handleDragOver = (e) => {
// //     e.preventDefault();
// //   };

// //   const handleDrop = (e, index) => {
// //     e.preventDefault();
// //     const letter = e.dataTransfer.getData('text/plain');
// //     const newDropZones = [...dropZones];
// //     newDropZones[index] = letter;
// //     setDropZones(newDropZones);

// //     if (newDropZones.every(zone => zone !== null)) {
// //       const arrangedWord = newDropZones.join('');
// //       const isCorrect = arrangedWord === currentWord.correct;
// //       const newScore = isCorrect ? score + 1 : score;

// //       axios.post('http://localhost:3000/child/save-game', {
// //         userId: localStorage.getItem('userId'),
// //         score: newScore,
// //         emotions: questionEmotions,
// //         question: currentWord.correct,
// //         isCorrect,
// //       }, {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('child_token')}` },
// //       })
// //         .then(res => console.log('Game progress saved:', res.data))
// //         .catch(error => console.error('Error saving game progress:', error));

// //       if (isCorrect) {
// //         setFeedback('Correct!');
// //         setScore(newScore);
// //         if (newScore >= words.length) {
// //           setGameCompleted(true);
// //         } else {
// //           setTimeout(() => {
// //             setWordIndex(prev => prev + 1);
// //             setFeedback(null);
// //             setDropZones(Array(currentWord.correct.length).fill(null));
// //           }, 1000);
// //         }
// //       } else {
// //         setFeedback('Try Again!');
// //         setTimeout(() => {
// //           setDropZones(Array(currentWord.correct.length).fill(null));
// //           setFeedback(null);
// //         }, 1000);
// //       }
// //     }
// //   };

// //   return (
// //     <div className="game-container">
// //       <video autoPlay loop muted playsInline className="background-video">
// //         <source src={videoFile} type="video/mp4" />
// //         Your browser does not support the video tag.
// //       </video>

// //       {currentEmotion && (
// //         <div
// //           style={{
// //             position: 'absolute',
// //             top: 0,
// //             left: 0,
// //             width: '100%',
// //             height: '100%',
// //             backgroundColor: emotionColors[currentEmotion.toLowerCase()],
// //             zIndex: 0,
// //             transition: 'background-color 0.5s ease',
// //           }}
// //         />
// //       )}

// //       <video
// //         ref={videoRef}
// //         style={{ display: 'none' }}
// //         autoPlay
// //         playsInline
// //         muted
// //         width="640"
// //         height="480"
// //       />

// //       <canvas
// //         ref={canvasRef}
// //         style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
// //         width="640"
// //         height="480"
// //       />

// //       <div
// //         ref={emotionDisplayRef}
// //         style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 2 }}
// //       />

// //       <div className="content">
// //         {!gameStarted ? (
// //           <>
// //             <h1>Welcome to the Game</h1>
// //             <button onClick={() => setGameStarted(true)} className="start-button">
// //               Start Game
// //             </button>
// //           </>
// //         ) : !gameCompleted ? (
// //           <div className="game-content">
// //             <h1>What is this animal?</h1>
// //             <div className="animal-container">
// //               {currentWord && <img src={currentWord.image} alt="Animal" className="animal-image" />}
// //             </div>

// //             <div className="letters-container">
// //               {letters.map((letter, index) => (
// //                 <div
// //                   key={index}
// //                   draggable
// //                   onDragStart={e => handleDragStart(e, letter)}
// //                   className="draggable-letter"
// //                 >
// //                   {letter}
// //                 </div>
// //               ))}
// //             </div>

// //             <div className="dropzones-container">
// //               {dropZones.map((zone, index) => (
// //                 <div
// //                   key={index}
// //                   onDragOver={handleDragOver}
// //                   onDrop={e => handleDrop(e, index)}
// //                   className={`dropzone ${zone ? 'filled' : ''}`}
// //                 >
// //                   {zone || '_'}
// //                 </div>
// //               ))}
// //             </div>

// //             {feedback && (
// //               <p className={`feedback ${feedback === 'Correct!' ? 'correct' : 'wrong'}`}>
// //                 {feedback}
// //               </p>
// //             )}
// //             <p className="score">Score: {score}</p>
// //           </div>
// //         ) : (
// //           <div className="game-content">
// //             <h2>Congratulations! You Won!</h2>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Game;
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import JSConfetti from 'js-confetti';
// import { useNavigate } from 'react-router-dom';
// import '../styles/game.css';
// import videoFile from '../assets/video.mp4';
// import dogImage from '../assets/dog.png';
// import catImage from '../assets/cat.png';
// import tigerImage from '../assets/tiger.png';
// import zebraImage from '../assets/zebra.png';
// import monkeyImage from '../assets/monkey.png';
// import horseImage from '../assets/horse.png';
// import gameBackImage from '../assets/Gameback.jpg';
// import useEmotionDetection from './EmotionDetection/useEmotionDetection';

// const Game = () => {
//   const [gameStarted, setGameStarted] = useState(false);
//   const [gameCompleted, setGameCompleted] = useState(false);
//   const [wordIndex, setWordIndex] = useState(0);
//   const [shuffledWords, setShuffledWords] = useState([]);
//   const [currentWord, setCurrentWord] = useState(null);
//   const [letters, setLetters] = useState([]);
//   const [dropZones, setDropZones] = useState([]);
//   const [score, setScore] = useState(0);
//   const [feedback, setFeedback] = useState(null);
//   const [currentEmotion, setCurrentEmotion] = useState(null);
//   const [questionEmotions, setQuestionEmotions] = useState([]);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const emotionDisplayRef = useRef(null);
//   const confettiRef = useRef(null);
//   const navigate = useNavigate();

//   const emotionColors = {
//     happy: 'rgba(255, 215, 0, 0.5)', // Gold
//     sad: 'rgba(135, 206, 235, 0.5)', // Sky Blue
//     angry: 'rgba(255, 69, 0, 0.5)', // Orange Red
//     surprise: 'rgba(152, 251, 152, 0.5)', // Pale Green
//     fear: 'rgba(221, 160, 221, 0.5)', // Plum
//     disgust: 'rgba(176, 196, 222, 0.5)', // Light Steel Blue
//     neutral: 'rgba(245, 245, 245, 0.5)', // Whitesmoke
//   };

//   useEffect(() => {
//     // Initialize JSConfetti
//     confettiRef.current = new JSConfetti();
//   }, []);

//   useEffect(() => {
//     if (gameCompleted) {
//       // Trigger confetti animation
//       confettiRef.current.addConfetti({
//         emojis: ['🎉', '🥳', '✨'],
//         confettiRadius: 6,
//         confettiNumber: 125,
//         confettiColors: ['#ff0a54', '#ff477e', '#ff85a1', '#6e8efb', '#a777e3'],
//       });

//       // Redirect to login page after 3 seconds
//       const timer = setTimeout(() => {
//         localStorage.removeItem('child_token'); // Clear child token if needed
//         localStorage.removeItem('userId'); // Clear userId
//         navigate('/'); // Redirect to login page
//       }, 3000);

//       return () => clearTimeout(timer); // Cleanup timer
//     }
//   }, [gameCompleted, navigate]);

//   const handleEmotionsCollected = (emotions) => {
//     setQuestionEmotions(emotions);
//     const emotionCounts = emotions.reduce((acc, emotion) => {
//       acc[emotion] = (acc[emotion] || 0) + 1;
//       return acc;
//     }, {});
//     const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
//       emotionCounts[a] > emotionCounts[b] ? a : b
//     );
//     setCurrentEmotion(dominantEmotion.toLowerCase());

//     const userId = localStorage.getItem('userId');
//     if (!userId || !currentWord) return;

//     axios
//       .post(
//         'http://localhost:3000/child/save-emotion',
//         {
//           userId,
//           emotion: dominantEmotion.toLowerCase(),
//           question: currentWord.correct,
//         },
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('child_token')}` },
//         }
//       )
//       .then((res) => console.log('Emotion saved:', res.data))
//       .catch((error) => console.error('Error saving emotion:', error));
//   };

//   useEmotionDetection(videoRef, canvasRef, emotionDisplayRef, gameStarted, handleEmotionsCollected);

//   const words = [
//     { correct: 'dog', jumbled: 'gdo', image: dogImage },
//     { correct: 'cat', jumbled: 'tac', image: catImage },
//     { correct: 'tiger', jumbled: 'ietgr', image: tigerImage },
//     { correct: 'horse', jumbled: 'soehr', image: horseImage },
//   ];

//   useEffect(() => {
//     setShuffledWords([...words].sort(() => Math.random() - 0.5));
//   }, []);

//   useEffect(() => {
//     if (shuffledWords.length > 0) {
//       const word = shuffledWords[wordIndex];
//       setCurrentWord(word);
//       setLetters(word.jumbled.split(''));
//       setDropZones(Array(word.correct.length).fill(null));
//       setQuestionEmotions([]);
//     }
//   }, [wordIndex, shuffledWords]);

//   const handleDragStart = (e, letter) => {
//     e.dataTransfer.setData('text/plain', letter);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//   };

//   const handleDrop = (e, index) => {
//     e.preventDefault();
//     const letter = e.dataTransfer.getData('text/plain');
//     const newDropZones = [...dropZones];
//     newDropZones[index] = letter;
//     setDropZones(newDropZones);

//     if (newDropZones.every((zone) => zone !== null)) {
//       const arrangedWord = newDropZones.join('');
//       const isCorrect = arrangedWord === currentWord.correct;
//       const newScore = isCorrect ? score + 1 : score;

//       axios
//         .post(
//           'http://localhost:3000/child/save-game',
//           {
//             userId: localStorage.getItem('userId'),
//             score: newScore,
//             emotions: questionEmotions,
//             question: currentWord.correct,
//             isCorrect,
//           },
//           {
//             headers: { Authorization: `Bearer ${localStorage.getItem('child_token')}` },
//           }
//         )
//         .then((res) => console.log('Game progress saved:', res.data))
//         .catch((error) => console.error('Error saving game progress:', error));

//       if (isCorrect) {
//         setFeedback('Correct!');
//         setScore(newScore);
//         if (newScore >= words.length) {
//           setGameCompleted(true);
//         } else {
//           setTimeout(() => {
//             setWordIndex((prev) => prev + 1);
//             setFeedback(null);
//             setDropZones(Array(currentWord.correct.length).fill(null));
//           }, 1000);
//         }
//       } else {
//         setFeedback('Try Again!');
//         setTimeout(() => {
//           setDropZones(Array(currentWord.correct.length).fill(null));
//           setFeedback(null);
//         }, 1000);
//       }
//     }
//   };

//   return (
//     <div
//       className="game-container"
//       style={
//         gameStarted
//           ? {
//               backgroundImage: `url(${gameBackImage})`,
//               backgroundSize: 'cover',
//               backgroundPosition: 'center',
//               backgroundRepeat: 'no-repeat',
//             }
//           : {}
//       }
//     >
//       {!gameStarted && (
//         <video autoPlay loop muted playsInline className="background-video">
//           <source src={videoFile} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       )}

//       {currentEmotion && (
//         <div
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             backgroundColor: emotionColors[currentEmotion.toLowerCase()],
//             zIndex: 0,
//             transition: 'background-color 0.5s ease',
//           }}
//         />
//       )}

//       <video
//         ref={videoRef}
//         style={{ display: 'none' }}
//         autoPlay
//         playsInline
//         muted
//         width="640"
//         height="480"
//       />

//       <canvas
//         ref={canvasRef}
//         style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
//         width="640"
//         height="480"
//       />

//       <div
//         ref={emotionDisplayRef}
//         style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 2 }}
//       />

//       <div className="content">
//         {!gameStarted ? (
//           <>
//             <h1>Welcome to the Game</h1>
//             <button onClick={() => setGameStarted(true)} className="start-button">
//               Start Game
//             </button>
//           </>
//         ) : !gameCompleted ? (
//           <div className="game-content">
//             <h1>What is this animal?</h1>
//             <div className="animal-container">
//               {currentWord && <img src={currentWord.image} alt="Animal" className="animal-image" />}
//             </div>

//             <div className="letters-container">
//               {letters.map((letter, index) => (
//                 <div
//                   key={index}
//                   draggable
//                   onDragStart={(e) => handleDragStart(e, letter)}
//                   className="draggable-letter"
//                 >
//                   {letter}
//                 </div>
//               ))}
//             </div>

//             <div className="dropzones-container">
//               {dropZones.map((zone, index) => (
//                 <div
//                   key={index}
//                   onDragOver={handleDragOver}
//                   onDrop={(e) => handleDrop(e, index)}
//                   className={`dropzone ${zone ? 'filled' : ''}`}
//                 >
//                   {zone || '_'}
//                 </div>
//               ))}
//             </div>

//             {feedback && (
//               <p className={`feedback ${feedback === 'Correct!' ? 'correct' : 'wrong'}`}>
//                 {feedback}
//               </p>
//             )}
//             <p className="score">Score: {score}</p>
//           </div>
//         ) : (
//           <div className="game-content">
//             <h1>Congratulations! You Won!</h1>
//             <p className="score">Final Score: {score}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Game;

// Game.js: Main component for the word unscramble game with emotion detection and video/image switching
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // For making HTTP requests to the backend
import JSConfetti from 'js-confetti'; // For confetti animation on game completion
import { useNavigate } from 'react-router-dom'; // For programmatic navigation
import '../styles/game.css'; // Styles for the game UI
import videoFile from '../assets/video.mp4'; // Background video for welcome screen
import dogImage from '../assets/dog.png'; // Image for dog word
import catImage from '../assets/cat.png'; // Image for cat word
import tigerImage from '../assets/tiger.png'; // Image for tiger word
import zebraImage from '../assets/zebra.png'; // Image for zebra word
import monkeyImage from '../assets/monkey.png'; // Image for monkey word
import horseImage from '../assets/horse.png'; // Image for horse word
import gameBackImage from '../assets/Gameback.jpg'; // Background image during gameplay
import tigerLaughVideo from '../assets/tigerlaugh.mp4'; // Video for tiger when specific emotions are detected
import useEmotionDetection from './EmotionDetection/useEmotionDetection'; // Custom hook for emotion detection

const Game = () => {
  // State to track if the game has started
  const [gameStarted, setGameStarted] = useState(false);
  // State to track if the game is completed (all words answered correctly)
  const [gameCompleted, setGameCompleted] = useState(false);
  // State to track the current word index in the shuffled words array
  const [wordIndex, setWordIndex] = useState(0);
  // State to store the shuffled array of words
  const [shuffledWords, setShuffledWords] = useState([]);
  // State to store the current word object (correct, jumbled, image)
  const [currentWord, setCurrentWord] = useState(null);
  // State to store the jumbled letters of the current word
  const [letters, setLetters] = useState([]);
  // State to store the letters dropped into drop zones
  const [dropZones, setDropZones] = useState([]);
  // State to track the player's score
  const [score, setScore] = useState(0);
  // State to display feedback (e.g., "Correct!" or "Try Again!")
  const [feedback, setFeedback] = useState(null);
  // State to store the current detected emotion
  const [currentEmotion, setCurrentEmotion] = useState(null);
  // State to store all emotions detected for the current question
  const [questionEmotions, setQuestionEmotions] = useState([]);
  // State to store the most recent game report
  const [recentReport, setRecentReport] = useState(null);
  // State to store any error message when fetching the report
  const [reportError, setReportError] = useState(null);

  // Refs for video, canvas, emotion display, and confetti
  const videoRef = useRef(null); // Ref for webcam video feed (hidden)
  const canvasRef = useRef(null); // Ref for canvas to render video feed
  const emotionDisplayRef = useRef(null); // Ref for displaying emotion data
  const confettiRef = useRef(null); // Ref for JSConfetti instance
  const navigate = useNavigate(); // Hook for navigation

  // Define background colors for different emotions (used for overlay)
  const emotionColors = {
    happy: 'rgba(167, 139, 250, 0.3)', // Soft purple
    sad: 'rgba(253, 186, 116, 0.3)', // Warm peach
    angry: 'rgba(110, 231, 183, 0.3)', // Mint green
    surprise: 'rgba(244, 114, 182, 0.3)', // Muted pink
    fear: 'rgba(252, 231, 122, 0.3)', // Soft yellow
    disgust: 'rgba(245, 194, 143, 0.3)', // Warm beige
    neutral: 'rgba(255, 245, 235, 0.3)', // Light cream
  };

  // Initialize JSConfetti on component mount
  useEffect(() => {
    confettiRef.current = new JSConfetti();
  }, []);

  // Handle game completion: trigger confetti and redirect to login
  useEffect(() => {
    if (gameCompleted) {
      // Show confetti animation with custom emojis and colors
      confettiRef.current.addConfetti({
        emojis: ['🎉', '🥳', '✨'],
        confettiRadius: 6,
        confettiNumber: 125,
        confettiColors: ['#ff0a54', '#ff477e', '#ff85a1', '#6e8efb', '#a777e3'],
      });

      // Redirect to login page after 5 seconds and clear local storage
      const timer = setTimeout(() => {
        localStorage.removeItem('child_token');
        localStorage.removeItem('userId');
        navigate('/');
      }, 5000);

      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    }
  }, [gameCompleted, navigate]);

  // Fetch the most recent game report when the game is completed
  useEffect(() => {
    if (gameCompleted) {
      const fetchRecentReport = async () => {
        try {
          const userId = localStorage.getItem('userId');
          const token = localStorage.getItem('child_token');
          if (!userId || !token) {
            throw new Error('User not logged in');
          }

          // Fetch the latest game report for the user
          const response = await axios.get(`http://localhost:3000/child/game-reports/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 1 },
          });

          setRecentReport(response.data[0]);
        } catch (err) {
          setReportError('Failed to load recent game report');
          console.error('Error fetching report:', err);
        }
      };

      fetchRecentReport();
    }
  }, [gameCompleted]);

  // Handle emotions collected from the emotion detection hook
  const handleEmotionsCollected = (emotions) => {
    setQuestionEmotions(emotions); // Store all detected emotions
    // Count occurrences of each emotion
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    // Determine the dominant emotion
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
    setCurrentEmotion(dominantEmotion.toLowerCase()); // Update current emotion

    const userId = localStorage.getItem('userId');
    if (!userId || !currentWord) return;

    // Save the dominant emotion to the backend
    axios
      .post(
        'http://localhost:3000/child/save-emotion',
        {
          userId,
          emotion: dominantEmotion.toLowerCase(),
          question: currentWord.correct,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('child_token')}` },
        }
      )
      .then((res) => console.log('Emotion saved:', res.data))
      .catch((error) => console.error('Error saving emotion:', error));
  };

  // Apply emotion detection hook to process webcam feed
  useEmotionDetection(videoRef, canvasRef, emotionDisplayRef, gameStarted, handleEmotionsCollected);

  // Define the words array with correct words, jumbled letters, and associated images
  const words = [
    { correct: 'dog', jumbled: 'gdo', image: dogImage },
    { correct: 'cat', jumbled: 'tac', image: catImage },
    { correct: 'tiger', jumbled: 'ietgr', image: tigerImage },
    { correct: 'horse', jumbled: 'soehr', image: horseImage },
  ];

  // Shuffle words on component mount
  useEffect(() => {
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
  }, []);

  // Update current word, letters, and drop zones when word index or shuffled words change
  useEffect(() => {
    if (shuffledWords.length > 0) {
      const word = shuffledWords[wordIndex];
      setCurrentWord(word);
      setLetters(word.jumbled.split('')); // Split jumbled word into individual letters
      setDropZones(Array(word.correct.length).fill(null)); // Initialize empty drop zones
      setQuestionEmotions([]); // Reset emotions for new question
    }
  }, [wordIndex, shuffledWords]);

  // Handle drag start event for draggable letters
  const handleDragStart = (e, letter) => {
    e.dataTransfer.setData('text/plain', letter);
  };

  // Allow dropping by preventing default behavior
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop event when a letter is dropped into a drop zone
  const handleDrop = (e, index) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData('text/plain');
    const newDropZones = [...dropZones];
    newDropZones[index] = letter; // Place letter in the drop zone
    setDropZones(newDropZones);

    // Check if all drop zones are filled
    if (newDropZones.every((zone) => zone !== null)) {
      const arrangedWord = newDropZones.join(''); // Form the arranged word
      const isCorrect = arrangedWord === currentWord.correct; // Check if correct
      const newScore = isCorrect ? score + 1 : score; // Update score if correct

      // Save game progress to the backend
      axios
        .post(
          'http://localhost:3000/child/save-game',
          {
            userId: localStorage.getItem('userId'),
            score: newScore,
            emotions: questionEmotions,
            question: currentWord.correct,
            isCorrect,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('child_token')}` },
          }
        )
        .then((res) => console.log('Game progress saved:', res.data))
        .catch((error) => console.error('Error saving game progress:', error));

      if (isCorrect) {
        setFeedback('Correct!');
        setScore(newScore);
        if (newScore >= words.length) {
          setGameCompleted(true); // End game if all words are correct
        } else {
          // Move to next word after 1 second
          setTimeout(() => {
            setWordIndex((prev) => prev + 1);
            setFeedback(null);
            setDropZones(Array(currentWord.correct.length).fill(null));
          }, 1000);
        }
      } else {
        setFeedback('Try Again!');
        // Reset drop zones after 1 second
        setTimeout(() => {
          setDropZones(Array(currentWord.correct.length).fill(null));
          setFeedback(null);
        }, 1000);
      }
    }
  };

  // Determine if the tiger laugh video should be shown (for tiger word with happy, angry, or sad emotion)
  const shouldShowTigerVideo =
    currentWord &&
    currentWord.correct === 'tiger' &&
    currentEmotion &&
    ['happy', 'angry', 'sad'].includes(currentEmotion.toLowerCase());

  return (
    <div
      className="game-container"
      style={
        gameStarted
          ? {
              backgroundImage: `url(${gameBackImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {}
      }
    >
      {/* Show background video before game starts */}
      {!gameStarted && (
        <video autoPlay loop muted playsInline className="background-video">
          <source src={videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Apply emotion-based background overlay */}
      {currentEmotion && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: emotionColors[currentEmotion.toLowerCase()],
            zIndex: 0,
            transition: 'background-color 0.5s ease',
          }}
        />
      )}

      {/* Hidden webcam feed for emotion detection */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
      />

      {/* Canvas for rendering video feed */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        width="640"
        height="480"
      />

      {/* Emotion display element */}
      <div
        ref={emotionDisplayRef}
        style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 2 }}
      />

      <div className="content">
        {/* Welcome screen before game starts */}
        {!gameStarted ? (
          <>
            <h1>Welcome to the Game</h1>
            <button onClick={() => setGameStarted(true)} className="start-button">
              Start Game
            </button>
          </>
        ) : !gameCompleted ? (
          <div className="game-content">
            <h1>What is this animal?</h1>
            <div className="animal-container">
              {currentWord && (
                shouldShowTigerVideo ? (
                  // Show tiger laugh video for specific emotions
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="animal-video"
                    src={tigerLaughVideo}
                    type="video/mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // Show static animal image otherwise
                  <img src={currentWord.image} alt="Animal" className="animal-image" />
                )
              )}
            </div>

            {/* Render draggable letters */}
            <div className="letters-container">
              {letters.map((letter, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, letter)}
                  className="draggable-letter"
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* Render drop zones */}
            <div className="dropzones-container">
              {dropZones.map((zone, index) => (
                <div
                  key={index}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`dropzone ${zone ? 'filled' : ''}`}
                >
                  {zone || '_'}
                </div>
              ))}
            </div>

            {/* Display feedback message */}
            {feedback && (
              <p className={`feedback ${feedback === 'Correct!' ? 'correct' : 'wrong'}`}>
                {feedback}
              </p>
            )}
            <p className="score">Score: {score}</p>
          </div>
        ) : (
          // Game completion screen
          <div className="game-content">
            <h1>Congratulations! You Won!</h1>
            <p className="score">Final Score: {score}</p>
            {reportError ? (
              <p className="report-error">{reportError}</p>
            ) : recentReport ? (
              // Display recent game report
              <div className="report-details">
                <h2>Latest Game Report</h2>
                <p><strong>Animal:</strong> {recentReport.question}</p>
                <p><strong>Score:</strong> {recentReport.score}</p>
                <p><strong>Emotion:</strong> {recentReport.emotions[0] || 'Unknown'}</p>
                <p><strong>Correct:</strong> {recentReport.isCorrect ? 'Yes' : 'No'}</p>
                <p><strong>Completed At:</strong> {new Date(recentReport.completedAt).toLocaleString()}</p>
              </div>
            ) : (
              <p>Loading recent game report...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
