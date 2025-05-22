
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QUIZ_QUESTIONS, TOTAL_QUIZ_TIME } from './constants';
import { Question, QuestionType, QuizStatus, QuestionResult } from './types';
import QuestionDisplay from './components/QuestionDisplay';
import TimerDisplay from './components/TimerDisplay';
import ResultsDisplay from './components/ResultsDisplay';
import Sidebar from './components/Sidebar';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon as SubmitIcon } from './components/icons';

// UI Text Konstanten (Deutsch)
const UI_TEXTS = {
  appTitle: 'Interaktives Quiz',
  startScreenSubtitle: `Teste dein Wissen! Du hast ${TOTAL_QUIZ_TIME / 60} Minuten Zeit, um alle Fragen zu beantworten. Viel Erfolg!`,
  startQuizButton: 'Quiz starten',
  sidebarToggleOpen: 'Sidebar öffnen',
  sidebarToggleClose: 'Sidebar schließen',
  quizHeader: 'Quiz',
  quizResultHeader: 'Quiz Ergebnis',
  quizResultQuestionHeader: 'Quiz Ergebnis (Frage {questionNumber})',
  previousButton: 'Vorherige',
  backToResultsButton: 'Zurück zur Auswertung',
  nextButton: 'Nächste',
  submitQuizButton: 'Quiz beenden',
  noQuestionsLoaded: 'Keine Fragen geladen.',
  timeUpMessage: 'Die Zeit ist abgelaufen! Dein Quiz wurde automatisch beendet.',
  questionLabel: 'Frage {current} von {total}',
  explanationLabel: 'Erläuterung:',
  timerLabel: 'Restzeit:',
  resultsTitle: 'Quiz beendet!',
  resultsCongratsPassed: 'Herzlichen Glückwunsch, bestanden!',
  resultsSorryFailed: 'Leider nicht bestanden.',
  resultsScoreSummary: 'Du hast {correctCount} von {totalQuestions} Fragen richtig beantwortet.',
  resultsFinalScore: 'Ergebnis:',
  retakeQuizButton: 'Quiz wiederholen',
  resultsReviewTitle: 'Deine Antworten im Überblick:',
  sidebarTitle: 'Prüfungsfragen', // Geändert von "Kursplan"
  sidebarAnsweredTooltip: 'Beantwortet',
  sidebarUnansweredTooltip: 'Unbeantwortet',
};


const App: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [quizStatus, setQuizStatus] = useState<QuizStatus>(QuizStatus.NOT_STARTED);
  const [scorePercentage, setScorePercentage] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_QUIZ_TIME);
  const [finalResults, setFinalResults] = useState<QuestionResult[]>([]);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  const questionsToDisplay = QUIZ_QUESTIONS; // Immer deutsche Fragen

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizStatus(QuizStatus.NOT_STARTED);
    setScorePercentage(0);
    setPassed(false);
    setTimeLeft(TOTAL_QUIZ_TIME);
    setFinalResults([]);
    setIsReviewing(false);
  }, []);

  const startQuiz = () => {
    resetQuiz(); 
    setQuizStatus(QuizStatus.IN_PROGRESS);
  };

  const handleAnswerSelect = useCallback((questionId: string, optionId: string) => {
    if (quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) return;

    setUserAnswers((prevAnswers) => {
      const currentQuestion = questionsToDisplay.find(q => q.id === questionId);
      if (!currentQuestion) return prevAnswers;

      const existingSelection = prevAnswers[questionId] || [];
      let newSelection: string[];

      if (currentQuestion.type === QuestionType.SINGLE_CHOICE) {
        newSelection = [optionId];
      } else {
        if (existingSelection.includes(optionId)) {
          newSelection = existingSelection.filter(id => id !== optionId);
        } else {
          newSelection = [...existingSelection, optionId];
        }
      }
      return { ...prevAnswers, [questionId]: newSelection };
    });
  }, [questionsToDisplay, quizStatus]);

  const calculateResults = useCallback(() => {
    let correctCount = 0;
    const results: QuestionResult[] = questionsToDisplay.map(q => {
      const userAnswerSelection = userAnswers[q.id] || [];
      let isCorrect = false;
      if (q.type === QuestionType.SINGLE_CHOICE) {
        isCorrect = userAnswerSelection.length === 1 && q.correctAnswers.includes(userAnswerSelection[0]);
      } else { 
        const sortedUserAnswers = [...userAnswerSelection].sort();
        const sortedCorrectAnswers = [...q.correctAnswers].sort();
        isCorrect = sortedUserAnswers.length === sortedCorrectAnswers.length &&
                    sortedUserAnswers.every((val, index) => val === sortedCorrectAnswers[index]);
      }

      if (isCorrect) {
        correctCount++;
      }
      return { 
        ...q, 
        userSelectedAnswers: userAnswerSelection,
        isCorrect 
      };
    });
    
    const percentage = (correctCount / questionsToDisplay.length) * 100;
    setScorePercentage(percentage);
    setPassed(percentage >= 51);
    setFinalResults(results);
    return { percentage, passedStatus: percentage >= 51, correctCount };
  }, [userAnswers, questionsToDisplay]);


  const handleSubmitQuiz = useCallback(() => {
    calculateResults();
    setQuizStatus(QuizStatus.SUBMITTED);
    setIsReviewing(false);
    window.speechSynthesis.cancel(); 
  }, [calculateResults]);

  const handleTimeUp = useCallback(() => {
    calculateResults();
    setQuizStatus(QuizStatus.TIME_UP);
    setIsReviewing(false);
    window.speechSynthesis.cancel();
  }, [calculateResults]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsToDisplay.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handleSidebarQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    if (quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) {
      setIsReviewing(true);
    }
  };

  const getQuestionStatus = useCallback((questionId: string, userSelectedAnswersForQuestion: string[]): 'correct' | 'incorrect' | 'unanswered' | 'answered' => {
    if (quizStatus !== QuizStatus.SUBMITTED && quizStatus !== QuizStatus.TIME_UP) {
        return (userSelectedAnswersForQuestion && userSelectedAnswersForQuestion.length > 0) ? 'answered' : 'unanswered';
    }
    
    const question = questionsToDisplay.find(q => q.id === questionId);
    if (!question) return 'unanswered';

    const result = finalResults.find(r => r.id === questionId);
    if (result) {
        return result.isCorrect ? 'correct' : 'incorrect';
    }
    
    let isCorrect = false;
    if (question.type === QuestionType.SINGLE_CHOICE) {
      isCorrect = userSelectedAnswersForQuestion.length === 1 && question.correctAnswers.includes(userSelectedAnswersForQuestion[0]);
    } else {
      const sortedUserAnswers = [...(userSelectedAnswersForQuestion || [])].sort();
      const sortedCorrectAnswers = [...question.correctAnswers].sort();
      isCorrect = sortedUserAnswers.length === sortedCorrectAnswers.length &&
                  sortedUserAnswers.every((val, index) => val === sortedCorrectAnswers[index]);
    }
    return isCorrect ? 'correct' : 'incorrect';
  }, [questionsToDisplay, quizStatus, finalResults]);

  const currentQ = questionsToDisplay[currentQuestionIndex];
  const currentUserAnsForCurrentQ = userAnswers[currentQ?.id] || [];
  
  if (quizStatus === QuizStatus.NOT_STARTED) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl text-center max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{UI_TEXTS.appTitle}</h1>
          <p className="text-gray-600 mb-8 text-lg">
            {UI_TEXTS.startScreenSubtitle}
          </p>
          <button
            onClick={startQuiz}
            className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {UI_TEXTS.startQuizButton}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-lightgray">
       {showSidebar && (
        <Sidebar
          questions={questionsToDisplay}
          currentQuestionIndex={currentQuestionIndex}
          userAnswers={userAnswers}
          quizSubmitted={quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP}
          onQuestionSelect={handleSidebarQuestionSelect}
          getQuestionStatus={getQuestionStatus}
          sidebarTitle={UI_TEXTS.sidebarTitle}
          answeredTooltip={UI_TEXTS.sidebarAnsweredTooltip}
          unansweredTooltip={UI_TEXTS.sidebarUnansweredTooltip}
        />
      )}
      <button 
        onClick={() => setShowSidebar(!showSidebar)} 
        className="md:hidden fixed top-2 left-2 z-50 bg-darkgray text-white p-2 rounded-md"
        aria-label={showSidebar ? UI_TEXTS.sidebarToggleClose : UI_TEXTS.sidebarToggleOpen}
      >
        {showSidebar ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </button>

      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {quizStatus === QuizStatus.IN_PROGRESS && UI_TEXTS.quizHeader}
            {(quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) && !isReviewing && UI_TEXTS.quizResultHeader}
            {(quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) && isReviewing && UI_TEXTS.quizResultQuestionHeader.replace('{questionNumber}', (currentQuestionIndex + 1).toString())}
          </h1>
          <div className="flex items-center gap-4">
            {(quizStatus === QuizStatus.IN_PROGRESS) && (
              <TimerDisplay 
                initialTime={timeLeft} 
                onTimeUp={handleTimeUp} 
                isRunning={quizStatus === QuizStatus.IN_PROGRESS}
                timerLabel={UI_TEXTS.timerLabel}
              />
            )}
          </div>
        </div>

        {isReviewing && (quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) && currentQ ? (
          <>
            <QuestionDisplay
              question={currentQ}
              userSelectedAnswers={currentUserAnsForCurrentQ}
              onAnswerSelect={() => {}}
              quizStatus={quizStatus}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questionsToDisplay.length}
              questionStatus={getQuestionStatus(currentQ.id, currentUserAnsForCurrentQ)}
              questionLabel={UI_TEXTS.questionLabel}
              explanationLabel={UI_TEXTS.explanationLabel}
            />
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="w-full sm:w-auto btn-secondary">
                <ChevronLeftIcon className="mr-2" /> {UI_TEXTS.previousButton}
              </button>
              <button onClick={() => setIsReviewing(false)} className="w-full sm:w-auto btn-neutral">
                {UI_TEXTS.backToResultsButton}
              </button>
              <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questionsToDisplay.length - 1} className="w-full sm:w-auto btn-primary">
                {UI_TEXTS.nextButton} <ChevronRightIcon className="ml-2" />
              </button>
            </div>
          </>
        ) : (quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) ? (
          <ResultsDisplay
            scorePercentage={scorePercentage}
            passed={passed}
            totalQuestions={questionsToDisplay.length}
            correctAnswersCount={finalResults.filter(r => r.isCorrect).length}
            onRetakeQuiz={startQuiz}
            results={finalResults} 
            onReviewQuestion={(index) => {
              setCurrentQuestionIndex(index);
              setIsReviewing(true);
            }}
            texts={UI_TEXTS} // Pass all UI texts
          />
        ) : currentQ ? (
          <>
            <QuestionDisplay
              question={currentQ}
              userSelectedAnswers={currentUserAnsForCurrentQ}
              onAnswerSelect={(optionId) => handleAnswerSelect(currentQ.id, optionId)}
              quizStatus={quizStatus}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questionsToDisplay.length}
              questionStatus={ getQuestionStatus(currentQ.id, currentUserAnsForCurrentQ) }
              questionLabel={UI_TEXTS.questionLabel}
              explanationLabel={UI_TEXTS.explanationLabel}
            />
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="w-full sm:w-auto btn-secondary">
                <ChevronLeftIcon className="mr-2" /> {UI_TEXTS.previousButton}
              </button>
              {currentQuestionIndex === questionsToDisplay.length - 1 ? (
                <button onClick={handleSubmitQuiz} className="w-full sm:w-auto btn-success">
                  <SubmitIcon className="mr-2" /> {UI_TEXTS.submitQuizButton}
                </button>
              ) : (
                <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questionsToDisplay.length - 1} className="w-full sm:w-auto btn-primary">
                  {UI_TEXTS.nextButton} <ChevronRightIcon className="ml-2" />
                </button>
              )}
            </div>
          </>
        ) : (
          <p>{UI_TEXTS.noQuestionsLoaded}</p>
        )}
         {quizStatus === QuizStatus.TIME_UP && !isReviewing && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
                {UI_TEXTS.timeUpMessage}
            </div>
        )}
      </main>
    </div>
  );
};

// Helper for button styling
const buttonBaseStyles = "flex items-center justify-center font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
(React.createElement as any)('style', null, `
  .btn-primary { @apply bg-gray-500 hover:bg-primary text-white ${buttonBaseStyles}; }
  .btn-secondary { @apply bg-gray-500 hover:bg-primary text-white ${buttonBaseStyles}; }
  .btn-success { @apply bg-secondary hover:bg-emerald-600 text-white ${buttonBaseStyles}; }
  .btn-neutral { @apply bg-gray-500 hover:bg-gray-600 text-white ${buttonBaseStyles}; }
`);


export default App;
