import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { UI_CONFIG } from '../../constants/spotify';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const QuizContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${UI_CONFIG.SPACING.XL};
  text-align: center;
`;

const QuizHeader = styled.div`
  margin-bottom: ${UI_CONFIG.SPACING.XL};
`;

const ListHeader = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONFIG.SPACING.XXL};
`;

const QuizTitle = styled.h1`
  color: ${UI_CONFIG.COLORS.WHITE};
  margin-bottom: ${UI_CONFIG.SPACING.MD};
  background: linear-gradient(135deg, ${UI_CONFIG.COLORS.WHITE} 0%, ${UI_CONFIG.COLORS.SPOTIFY_GREEN} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ScoreBoard = styled.div`
  display: flex;
  justify-content: center;
  gap: ${UI_CONFIG.SPACING.XL};
  margin-bottom: ${UI_CONFIG.SPACING.XL};
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    gap: ${UI_CONFIG.SPACING.MD};
  }
`;

const ScoreItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: ${UI_CONFIG.SPACING.MD};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 100px;

  .label {
    color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
    font-size: 0.9rem;
    margin-bottom: 4px;
  }

  .value {
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const GameArea = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: ${UI_CONFIG.SPACING.XXL};
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: ${UI_CONFIG.SPACING.XL};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.XL};
  }
`;

const QuestionCounter = styled.div`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1rem;
  margin-bottom: ${UI_CONFIG.SPACING.LG};
`;

const AudioPlayer = styled.div`
  margin-bottom: ${UI_CONFIG.SPACING.XL};
`;

const PlayButton = styled(Button)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  font-size: 2rem;
  margin-bottom: ${UI_CONFIG.SPACING.MD};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin: ${UI_CONFIG.SPACING.MD} 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${UI_CONFIG.COLORS.SPOTIFY_GREEN}, #1ed760);
  border-radius: 3px;
  width: ${props => props.$progress}%;
  transition: width 0.1s linear;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${UI_CONFIG.SPACING.MD};
  margin-bottom: ${UI_CONFIG.SPACING.XL};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled(Button)`
  padding: ${UI_CONFIG.SPACING.LG};
  text-align: left;
  justify-content: flex-start;
  font-size: 1rem;
  line-height: 1.4;
  min-height: 80px;
  position: relative;
  overflow: hidden;

  ${props => props.selected && `
    background: ${props.correct ? 
      'linear-gradient(135deg, #22c55e, #16a34a)' : 
      'linear-gradient(135deg, #ef4444, #dc2626)'
    };
    color: white;
  `}

  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
  `}

  &::before {
    content: '${props => props.optionLetter}';
    position: absolute;
    top: ${UI_CONFIG.SPACING.SM};
    left: ${UI_CONFIG.SPACING.SM};
    width: 24px;
    height: 24px;
    background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    color: ${UI_CONFIG.COLORS.SPOTIFY_BLACK};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .track-info {
    margin-left: 40px;
  }

  .track-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .artist-name {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const ResultMessage = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  
  &.correct {
    color: #22c55e;
  }
  
  &.incorrect {
    color: #ef4444;
  }
`;

const GameOverScreen = styled.div`
  text-align: center;
  padding: ${UI_CONFIG.SPACING.XXL};

  h2 {
    color: ${UI_CONFIG.COLORS.WHITE};
    margin-bottom: ${UI_CONFIG.SPACING.LG};
    font-size: 2rem;
  }

  .final-score {
    font-size: 3rem;
    font-weight: 700;
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    margin-bottom: ${UI_CONFIG.SPACING.MD};
  }

  .score-text {
    color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
    font-size: 1.1rem;
    margin-bottom: ${UI_CONFIG.SPACING.XL};
  }
`;

const MusicQuiz = ({ tracks = [] }) => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, answered, gameOver
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [options, setOptions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  
  const audioRef = useRef(null);
  const progressInterval = useRef(null);
  const timeoutRef = useRef(null);

  const TOTAL_QUESTIONS = 10;
  const PLAY_DURATION = 5000; // 5 seconds

  // Initialize game
  const startGame = () => {
    if (tracks.length < 4) {
      alert('Need at least 4 tracks to start the quiz!');
      return;
    }
    
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    generateQuestion();
  };

  // Generate a new question
  const generateQuestion = () => {
    if (currentQuestion >= TOTAL_QUESTIONS) {
      setGameState('gameOver');
      return;
    }

    // Select random correct answer
    const correctTrack = tracks[Math.floor(Math.random() * tracks.length)];
    
    // Generate 3 wrong options
    const wrongOptions = [];
    while (wrongOptions.length < 3) {
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      if (randomTrack.id !== correctTrack.id && 
          !wrongOptions.find(t => t.id === randomTrack.id)) {
        wrongOptions.push(randomTrack);
      }
    }

    // Shuffle options
    const allOptions = [correctTrack, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setCorrectAnswer(correctTrack.id);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setProgress(0);
    setTimeLeft(5);
    
    // Load audio if available
    if (correctTrack.preview_url) {
      if (audioRef.current) {
        audioRef.current.src = correctTrack.preview_url;
      }
    }
  };

  // Play audio snippet
  const playSnippet = () => {
    if (!audioRef.current || !audioRef.current.src) {
      alert('No preview available for this track!');
      return;
    }

    setIsPlaying(true);
    audioRef.current.currentTime = 0;
    audioRef.current.play();

    // Progress bar animation
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (PLAY_DURATION / 100));
        if (newProgress >= 100) {
          stopAudio();
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Auto stop after 5 seconds
    timeoutRef.current = setTimeout(() => {
      stopAudio();
    }, PLAY_DURATION);
  };

  // Stop audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    clearInterval(progressInterval.current);
    clearTimeout(timeoutRef.current);
  };

  // Handle answer selection
  const selectAnswer = (trackId) => {
    if (gameState !== 'playing' || selectedAnswer !== null) return;

    stopAudio();
    setSelectedAnswer(trackId);
    setGameState('answered');

    if (trackId === correctAnswer) {
      setScore(prev => prev + 1);
    }

    // Show result for 2 seconds, then next question
    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
      if (currentQuestion + 1 >= TOTAL_QUESTIONS) {
        setGameState('gameOver');
      } else {
        setGameState('playing');
        generateQuestion();
      }
    }, 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (tracks.length === 0) {
    return (
      <QuizContainer>
        <LoadingSpinner text="Loading your tracks for the quiz..." />
      </QuizContainer>
    );
  }

  return (
    <QuizContainer>
      <audio ref={audioRef} />
      
      <QuizHeader>
        <QuizTitle>🎵 Music Quiz</QuizTitle>
        <ScoreBoard>
          <ScoreItem>
            <div className="label">{t('quiz.score')}</div>
            <div className="value">{score}</div>
          </ScoreItem>
          <ScoreItem>
            <div className="label">{t('quiz.question')}</div>
            <div className="value">{gameState === 'waiting' ? '0' : currentQuestion + 1}</div>
          </ScoreItem>
          <ScoreItem>
            <div className="label">{t('quiz.total')}</div>
            <div className="value">{TOTAL_QUESTIONS}</div>
          </ScoreItem>
        </ScoreBoard>
      </QuizHeader>

      {gameState === 'waiting' && (
        <GameArea>
          <h2 style={{ color: UI_CONFIG.COLORS.WHITE, marginBottom: UI_CONFIG.SPACING.LG }}>
            {t('quiz.ready')}
          </h2>
          <p style={{ color: UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY, marginBottom: UI_CONFIG.SPACING.XL }}>
            {t('quiz.instructions')}
          </p>
          <Button variant="primary" size="large" onClick={startGame}>
            🎮 {t('quiz.startQuiz')}
          </Button>
        </GameArea>
      )}

      {(gameState === 'playing' || gameState === 'answered') && (
        <GameArea>
          <QuestionCounter>
            {t('quiz.questionCounter', { current: currentQuestion + 1, total: TOTAL_QUESTIONS })}
          </QuestionCounter>

          <AudioPlayer>
            <PlayButton
              variant="primary"
              onClick={playSnippet}
              disabled={isPlaying || gameState === 'answered'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </PlayButton>
            <ProgressBar>
              <ProgressFill $progress={progress} />
            </ProgressBar>
            <p style={{ color: UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY, fontSize: '0.9rem' }}>
              {isPlaying ? 'Playing...' : 'Click to play 5-second snippet'}
            </p>
          </AudioPlayer>

          {gameState === 'answered' && (
            <ResultMessage className={selectedAnswer === correctAnswer ? 'correct' : 'incorrect'}>
              {selectedAnswer === correctAnswer ? '🎉 Correct!' : '❌ Wrong!'}
            </ResultMessage>
          )}

          <OptionsGrid>
            {options.map((track, index) => (
              <OptionButton
                key={track.id}
                variant="secondary"
                optionLetter={String.fromCharCode(65 + index)} // A, B, C, D
                selected={selectedAnswer === track.id}
                correct={track.id === correctAnswer}
                disabled={gameState === 'answered'}
                onClick={() => selectAnswer(track.id)}
              >
                <div className="track-info">
                  <div className="track-name">{track.name}</div>
                  <div className="artist-name">
                    {track.artists?.map(a => a.name).join(', ')}
                  </div>
                </div>
              </OptionButton>
            ))}
          </OptionsGrid>
        </GameArea>
      )}

      {gameState === 'gameOver' && (
        <GameOverScreen>
          <h2>🏆 {t('quiz.complete')}</h2>
          <div className="final-score">{score}/{TOTAL_QUESTIONS}</div>
          <div className="score-text">
            {score === TOTAL_QUESTIONS ? t('quiz.scoreMessages.perfect') :
             score >= TOTAL_QUESTIONS * 0.8 ? t('quiz.scoreMessages.excellent') :
             score >= TOTAL_QUESTIONS * 0.6 ? t('quiz.scoreMessages.good') :
             t('quiz.scoreMessages.keepExploring')}
          </div>
          <Button variant="primary" size="large" onClick={startGame}>
            🔄 {t('quiz.playAgain')}
          </Button>
        </GameOverScreen>
      )}
    </QuizContainer>
  );
};

export default MusicQuiz;
