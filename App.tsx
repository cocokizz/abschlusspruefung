
import React, { useState, useEffect, useCallback } from 'react';
import { QUIZ_QUESTIONS, TOTAL_QUIZ_TIME } from './constants';
import { Question, QuestionType, UserAnswer, QuizStatus, AnswerOption, QuestionResult } from './types';
import QuestionDisplay from './components/QuestionDisplay';
import TimerDisplay from './components/TimerDisplay';
import ResultsDisplay from './components/ResultsDisplay';
import Sidebar from './components/Sidebar';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon as SubmitIcon } from './components/icons';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(QUIZ_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [quizStatus, setQuizStatus] = useState<QuizStatus>(QuizStatus.NOT_STARTED);
  const [scorePercentage, setScorePercentage] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_QUIZ_TIME);
  const [finalResults, setFinalResults] = useState<QuestionResult[]>([]);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizStatus(QuizStatus.NOT_STARTED);
    setScorePercentage(0);
    setPassed(false);
    setTimeLeft(TOTAL_QUIZ_TIME);
    setFinalResults([]);
    setIsReviewing(false); // Reset review mode
  }, []);

  const startQuiz = () => {
    resetQuiz(); 
    setQuizStatus(QuizStatus.IN_PROGRESS);
  };

  const handleAnswerSelect = useCallback((questionId: string, optionId: string) => {
    if (quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) return;

    setUserAnswers((prevAnswers) => {
      const currentQuestion = questions.find(q => q.id === questionId);
      if (!currentQuestion) return prevAnswers;

      const existingSelection = prevAnswers[questionId] || [];
      let newSelection: string[];

      if (currentQuestion.type === QuestionType.SINGLE_CHOICE) {
        newSelection = [optionId];
      } else { // MULTIPLE_CHOICE
        if (existingSelection.includes(optionId)) {
          newSelection = existingSelection.filter(id => id !== optionId);
        } else {
          newSelection = [...existingSelection, optionId];
        }
      }
      return { ...prevAnswers, [questionId]: newSelection };
    });
  }, [questions, quizStatus]);

  const calculateResults = useCallback(() => {
    let correctCount = 0;
    const results: QuestionResult[] = questions.map(q => {
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
    
    const percentage = (correctCount / questions.length) * 100;
    setScorePercentage(percentage);
    setPassed(percentage >= 51);
    setFinalResults(results);
    return { percentage, passedStatus: percentage >= 51, correctCount };
  }, [userAnswers, questions]);


  const handleSubmitQuiz = useCallback(() => {
    calculateResults();
    setQuizStatus(QuizStatus.SUBMITTED);
    setIsReviewing(false); // Show results page first
    window.speechSynthesis.cancel(); 
  }, [calculateResults]);

  const handleTimeUp = useCallback(() => {
    calculateResults();
    setQuizStatus(QuizStatus.TIME_UP);
    setIsReviewing(false); // Show results page first
    window.speechSynthesis.cancel();
  }, [calculateResults]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSidebarQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    if (quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) {
      setIsReviewing(true); // If quiz is over, selecting a question means reviewing it
    }
  };


  const getQuestionStatus = useCallback((questionId: string, userSelectedAnswers: string[]): 'correct' | 'incorrect' | 'unanswered' | 'answered' => {
    if (quizStatus !== QuizStatus.SUBMITTED && quizStatus !== QuizStatus.TIME_UP) {
        return (userSelectedAnswers && userSelectedAnswers.length > 0) ? 'answered' : 'unanswered';
    }
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return 'unanswered';

    const result = finalResults.find(r => r.id === questionId);
    if (result) {
        return result.isCorrect ? 'correct' : 'incorrect';
    }
    
    let isCorrect = false;
    if (question.type === QuestionType.SINGLE_CHOICE) {
      isCorrect = userSelectedAnswers.length === 1 && question.correctAnswers.includes(userSelectedAnswers[0]);
    } else {
      const sortedUserAnswers = [...(userSelectedAnswers || [])].sort();
      const sortedCorrectAnswers = [...question.correctAnswers].sort();
      isCorrect = sortedUserAnswers.length === sortedCorrectAnswers.length &&
                  sortedUserAnswers.every((val, index) => val === sortedCorrectAnswers[index]);
    }
    return isCorrect ? 'correct' : 'incorrect';
  }, [questions, quizStatus, finalResults]);


  const currentQ = questions[currentQuestionIndex];
  const currentUserAns = userAnswers[currentQ?.id] || [];
  
  if (quizStatus === QuizStatus.NOT_STARTED) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl text-center max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Interaktives Quiz</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Teste dein Wissen! Du hast {TOTAL_QUIZ_TIME / 60} Minuten Zeit, um alle Fragen zu beantworten.
            Viel Erfolg!
          </p>
          <button
            onClick={startQuiz}
            className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Quiz starten
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col md:flex-row h-screen bg-lightgray">
       {showSidebar && (
        <Sidebar
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          userAnswers={userAnswers}
          quizSubmitted={quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP}
          onQuestionSelect={handleSidebarQuestionSelect}
          getQuestionStatus={(qid, uans) => getQuestionStatus(qid, uans)}
        />
      )}
      <button 
        onClick={() => setShowSidebar(!showSidebar)} 
        className="md:hidden fixed top-2 left-2 z-50 bg-darkgray text-white p-2 rounded-md"
        aria-label={showSidebar ? "Sidebar schließen" : "Sidebar öffnen"}
      >
        {showSidebar ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </button>

      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {quizStatus === QuizStatus.IN_PROGRESS && 'Quiz'}
            {(quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) && !isReviewing && 'Quiz Ergebnis'}
            {(quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) && isReviewing && `Quiz Ergebnis (Frage ${currentQuestionIndex + 1})`}
          </h1>
          {(quizStatus === QuizStatus.IN_PROGRESS) && (
            <TimerDisplay initialTime={timeLeft} onTimeUp={handleTimeUp} isRunning={quizStatus === QuizStatus.IN_PROGRESS} />
          )}
        </div>

        {isReviewing && (quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) && currentQ ? (
          // Reviewing a specific question
          <>
            <QuestionDisplay
              question={currentQ}
              userSelectedAnswers={currentUserAns}
              onAnswerSelect={() => {}} // No answer selection in review mode
              quizStatus={quizStatus}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              questionStatus={getQuestionStatus(currentQ.id, currentUserAns)}
            />
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="mr-2" />
                Vorherige
              </button>
              <button
                onClick={() => setIsReviewing(false)}
                className="w-full sm:w-auto flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
              >
                Zurück zur Auswertung
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="w-full sm:w-auto flex items-center justify-center bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Nächste
                <ChevronRightIcon className="ml-2" />
              </button>
            </div>
          </>
        ) : (quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP) ? (
          // Showing ResultsDisplay
          <ResultsDisplay
            scorePercentage={scorePercentage}
            passed={passed}
            totalQuestions={questions.length}
            correctAnswersCount={finalResults.filter(r => r.isCorrect).length}
            onRetakeQuiz={startQuiz}
            results={finalResults}
            onReviewQuestion={(index) => {
              setCurrentQuestionIndex(index);
              setIsReviewing(true);
            }}
          />
        ) : currentQ ? (
          // Quiz in Progress
          <>
            <QuestionDisplay
              question={currentQ}
              userSelectedAnswers={currentUserAns}
              onAnswerSelect={(optionId) => handleAnswerSelect(currentQ.id, optionId)}
              quizStatus={quizStatus}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              questionStatus={ getQuestionStatus(currentQ.id, currentUserAns) }
            />
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="mr-2" />
                Vorherige
              </button>
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="w-full sm:w-auto flex items-center justify-center bg-secondary hover:bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
                >
                  <SubmitIcon className="mr-2" />
                  Quiz beenden
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="w-full sm:w-auto flex items-center justify-center bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nächste
                  <ChevronRightIcon className="ml-2" />
                </button>
              )}
            </div>
          </>
        ) : (
          <p>Keine Fragen geladen.</p>
        )}
         {quizStatus === QuizStatus.TIME_UP && !isReviewing && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
                Die Zeit ist abgelaufen! Dein Quiz wurde automatisch beendet.
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
