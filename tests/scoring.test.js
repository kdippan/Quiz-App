/* tests/scoring.test.js */

// Import the scoring utilities
const ScoringUtils = require('../client/utils/scoring');

describe('ScoringUtils', () => {
    describe('calculateScore', () => {
        test('should calculate perfect score correctly', () => {
            const userAnswers = [1, 2, 0, 3];
            const correctAnswers = [1, 2, 0, 3];
            
            const result = ScoringUtils.calculateScore(userAnswers, correctAnswers);
            
            expect(result.correct).toBe(4);
            expect(result.total).toBe(4);
            expect(result.percentage).toBe(100);
            expect(result.grade).toBe('A');
            expect(result.passed).toBe(true);
        });

        test('should calculate partial score correctly', () => {
            const userAnswers = [1, 2, 1, 3];
            const correctAnswers = [1, 2, 0, 3];
            
            const result = ScoringUtils.calculateScore(userAnswers, correctAnswers);
            
            expect(result.correct).toBe(3);
            expect(result.total).toBe(4);
            expect(result.percentage).toBe(75);
            expect(result.grade).toBe('C');
            expect(result.passed).toBe(true);
        });

        test('should calculate failing score correctly', () => {
            const userAnswers = [0, 0, 1, 1];
            const correctAnswers = [1, 2, 0, 3];
            
            const result = ScoringUtils.calculateScore(userAnswers, correctAnswers);
            
            expect(result.correct).toBe(0);
            expect(result.total).toBe(4);
            expect(result.percentage).toBe(0);
            expect(result.grade).toBe('F');
            expect(result.passed).toBe(false);
        });

        test('should handle empty arrays', () => {
            const result = ScoringUtils.calculateScore([], []);
            
            expect(result.correct).toBe(0);
            expect(result.total).toBe(0);
            expect(result.percentage).toBe(0);
            expect(result.grade).toBe('F');
            expect(result.passed).toBe(false);
        });

        test('should throw error for mismatched array lengths', () => {
            expect(() => {
                ScoringUtils.calculateScore([1, 2], [1, 2, 3]);
            }).toThrow('User answers and correct answers arrays must have the same length');
        });

        test('should throw error for non-array inputs', () => {
            expect(() => {
                ScoringUtils.calculateScore('not array', [1, 2, 3]);
            }).toThrow('Both userAnswers and correctAnswers must be arrays');
        });
    });

    describe('getGrade', () => {
        test('should return correct grades for various percentages', () => {
            expect(ScoringUtils.getGrade(95)).toBe('A');
            expect(ScoringUtils.getGrade(90)).toBe('A');
            expect(ScoringUtils.getGrade(85)).toBe('B');
            expect(ScoringUtils.getGrade(80)).toBe('B');
            expect(ScoringUtils.getGrade(75)).toBe('C');
            expect(ScoringUtils.getGrade(70)).toBe('C');
            expect(ScoringUtils.getGrade(65)).toBe('D');
            expect(ScoringUtils.getGrade(60)).toBe('D');
            expect(ScoringUtils.getGrade(55)).toBe('F');
            expect(ScoringUtils.getGrade(0)).toBe('F');
        });
    });

    describe('generateQuestionResults', () => {
        const mockQuiz = {
            questions: [
                {
                    id: 'q1',
                    questionText: 'What is 2+2?',
                    options: ['3', '4', '5', '6'],
                    correctIndex: 1
                },
                {
                    id: 'q2',
                    questionText: 'What is the capital of France?',
                    options: ['London', 'Berlin', 'Paris', 'Madrid'],
                    correctIndex: 2
                }
            ]
        };

        test('should generate correct results for all correct answers', () => {
            const userAnswers = [1, 2];
            const results = ScoringUtils.generateQuestionResults(mockQuiz, userAnswers);

            expect(results).toHaveLength(2);
            expect(results[0].isCorrect).toBe(true);
            expect(results[0].userAnswer).toBe('4');
            expect(results[0].correctAnswer).toBe('4');
            expect(results[1].isCorrect).toBe(true);
            expect(results[1].userAnswer).toBe('Paris');
            expect(results[1].correctAnswer).toBe('Paris');
        });

        test('should generate correct results for mixed answers', () => {
            const userAnswers = [0, 2];
            const results = ScoringUtils.generateQuestionResults(mockQuiz, userAnswers);

            expect(results[0].isCorrect).toBe(false);
            expect(results[0].userAnswer).toBe('3');
            expect(results[0].correctAnswer).toBe('4');
            expect(results[1].isCorrect).toBe(true);
            expect(results[1].userAnswer).toBe('Paris');
            expect(results[1].correctAnswer).toBe('Paris');
        });

        test('should handle unanswered questions', () => {
            const userAnswers = [-1, 2];
            const results = ScoringUtils.generateQuestionResults(mockQuiz, userAnswers);

            expect(results[0].answered).toBe(false);
            expect(results[0].userAnswer).toBe('No answer');
            expect(results[0].isCorrect).toBe(false);
        });

        test('should throw error for invalid inputs', () => {
            expect(() => {
                ScoringUtils.generateQuestionResults(null, [1, 2]);
            }).toThrow('Invalid quiz or userAnswers provided');

            expect(() => {
                ScoringUtils.generateQuestionResults(mockQuiz, 'not array');
            }).toThrow('Invalid quiz or userAnswers provided');
        });
    });

    describe('validateAnswers', () => {
        test('should validate complete answers', () => {
            const userAnswers = [1, 2, 0, 3];
            const result = ScoringUtils.validateAnswers(userAnswers);

            expect(result.isComplete).toBe(true);
            expect(result.unanswered).toEqual([]);
            expect(result.totalAnswered).toBe(4);
            expect(result.totalQuestions).toBe(4);
        });

        test('should identify unanswered questions', () => {
            const userAnswers = [1, -1, 0, null];
            const result = ScoringUtils.validateAnswers(userAnswers);

            expect(result.isComplete).toBe(false);
            expect(result.unanswered).toEqual([2, 4]);
            expect(result.totalAnswered).toBe(2);
            expect(result.totalQuestions).toBe(4);
        });

        test('should handle all unanswered questions', () => {
            const userAnswers = [-1, null, undefined];
            const result = ScoringUtils.validateAnswers(userAnswers);

            expect(result.isComplete).toBe(false);
            expect(result.unanswered).toEqual([1, 2, 3]);
            expect(result.totalAnswered).toBe(0);
            expect(result.totalQuestions).toBe(3);
        });
    });

    describe('formatTime', () => {
        test('should format time correctly', () => {
            expect(ScoringUtils.formatTime(0)).toBe('00:00');
            expect(ScoringUtils.formatTime(30)).toBe('00:30');
            expect(ScoringUtils.formatTime(60)).toBe('01:00');
            expect(ScoringUtils.formatTime(90)).toBe('01:30');
            expect(ScoringUtils.formatTime(3661)).toBe('61:01');
        });
    });
});