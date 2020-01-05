import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import CsvDownload from 'react-json-to-csv';
import './App.css';
import { READING_TIME, ANSWER_TIME, NEXT_QUESTION_TIME, QUESTIONS } from './data';

export const useWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const handleWidthChange = () => setWidth(window.innerWidth);

    useEffect(() => {
        window.addEventListener('resize', handleWidthChange);
        return () => window.removeEventListener('resize', handleWidthChange);
    }, []);

    return width;
};

export const useHeight = () => {
    const [height, setHeight] = useState(window.innerHeight);
    const handleHeightChange = () => setHeight(window.innerHeight);

    useEffect(() => {
        window.addEventListener('resize', handleHeightChange);
        return () => window.removeEventListener('resize', handleHeightChange);
    }, []);

    return height;
};

const Circle = ({ height, width }) => {
    const diameter = Math.min(height, width) - 50;
    const childs = [
        { right: diameter / 2 - 10, top: 0, margin: 10 },
        { top: diameter / 2 - 10, margin: 10, right: 0 },
        { right: diameter / 2 - 10, bottom: 0, margin: 10 },
        { bottom: diameter / 2 - 10, margin: 10, left: 0 },
        { top: diameter / 7 - 10, margin: 20, left: diameter / 7 - 10 },
        { bottom: diameter / 7 - 10, margin: 20, left: diameter / 7 - 10 },
        { bottom: diameter / 7 - 10, margin: 20, right: diameter / 7 - 10 },
        { top: diameter / 7 - 10, margin: 20, right: diameter / 7 - 10 },
    ];

    return (
        <div style={styles.mainCircleContainer}>
            <div style={{ ...styles.mainCircle, height: diameter, width: diameter }}>
                {childs.map(item => (
                    <div style={{ ...styles.childCircles, ...item }}></div>
                ))}
            </div>
        </div>
    );
};

const QuestionElement = ({ nextQuestion, question }) => {
    const [seconds, setSeconds] = useState(READING_TIME);
    const [answer, setAnswer] = useState();
    const [giveAnswer, setGiveAnswer] = useState(false);
    const [angle, setAngle] = useState();

    const ANSWER_WINDOW_HEIGHT = useHeight() - 120;
    const height = useHeight();
    const ANSWER_WINDOW_WIDTH = useWidth() - 100;

    useEffect(() => {
        let interval = null;
        interval = setInterval(() => {
            setSeconds(seconds => ((seconds - 0.1) * 10) / 10);
        }, 100);

        if (seconds < 0) {
            if (!giveAnswer) {
                setGiveAnswer(ANSWER_TIME);
                setSeconds(15);
            } else if (!answer) {
                setAnswer(1000);
                setSeconds(NEXT_QUESTION_TIME);
            } else seeNextQuestion(null);
        }
        return () => clearInterval(interval);
    }, [seconds]);

    const seeNextQuestion = () => {
        nextQuestion(answer);
    };

    useEffect(() => {
        setSeconds(READING_TIME);
        setGiveAnswer(false);
        setAnswer(null);
    }, [question]);

    const computeAnswer = e => {
        const x = e.nativeEvent.offsetX,
            y = ANSWER_WINDOW_HEIGHT - e.nativeEvent.offsetY;

        let value = (Math.atan((y - ANSWER_WINDOW_HEIGHT / 2) / (x - ANSWER_WINDOW_WIDTH / 2)) * 180) / Math.PI;

        console.log('angle cor', x, y);

        if (x >= ANSWER_WINDOW_WIDTH / 2) {
            value = 90 - value;
        } else value = 270 - value;

        setAngle(parseInt(value));
        return parseInt(value);
    };

    const saveAnswer = value => {
        setAnswer({ answer: value, time: parseInt((ANSWER_TIME - seconds) * 10) / 10 });
        setSeconds(NEXT_QUESTION_TIME);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: height,
            }}
        >
            <div style={styles.titleContainer}>
                {!answer && (
                    <>
                        <div style={{ fontSize: 20 }}>{!giveAnswer ? 'Question Reading Time' : `Answer Time`}</div>
                        <div style={styles.timer}>
                            <div>{parseInt(seconds)}</div>
                        </div>
                    </>
                )}
            </div>
            <div
                style={{
                    ...styles.answerContainer,
                    width: ANSWER_WINDOW_WIDTH,
                    height: ANSWER_WINDOW_HEIGHT,
                }}
            >
                {!giveAnswer ? (
                    <div style={styles.questionContainer}>
                        <div style={{ fontSize: 24, marginBottom: 100 }}>{question}</div>
                    </div>
                ) : !answer ? (
                    <>
                        <Circle height={ANSWER_WINDOW_HEIGHT} width={ANSWER_WINDOW_WIDTH} />
                        <div
                            onClick={e => saveAnswer(angle)}
                            style={{
                                ...styles.rod,
                                transform: `rotate(${angle - 90}deg)`,
                                backgroundColor: angle ? '#444' : '#ccc',
                                width: Math.min(ANSWER_WINDOW_HEIGHT, ANSWER_WINDOW_WIDTH) / 2 - 50,
                                top: ANSWER_WINDOW_HEIGHT / 2,
                                left: ANSWER_WINDOW_WIDTH / 2,
                            }}
                        ></div>
                        <div
                            onMouseMove={e => computeAnswer(e)}
                            onClick={e => saveAnswer(angle)}
                            style={styles.movementResponseScreen}
                        ></div>
                    </>
                ) : (
                    <>
                        <div style={styles.resultContainer}>
                            <div
                                style={{
                                    marginTop: ANSWER_WINDOW_HEIGHT / 4,
                                    fontSize: 40,
                                    color: answer !== 1000 ? '#32CD32' : '#a00',
                                    fontWeight: answer !== 1000 ? 800 : 400,
                                }}
                            >
                                {answer !== 1000 ? `Answer Saved` : `No answer Given`}
                            </div>
                            <div style={{ fontSize: 20, marginTop: 60 }}>{`Next Question in ${parseInt(seconds)}`}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const App = () => {
    const [question, setQuestion] = useState(0);
    const [start, setStart] = useState(false);
    const [data, setData] = useState([]);

    console.log(data, 'data');

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {!start ? (
                <div style={styles.startContainer}>
                    <div style={{ fontSize: 20, marginBottom: 20, fontWeight: 600 }}>{`Awesome Quiz`}</div>

                    <button onClick={() => setStart(true)} style={styles.buttonStyle}>
                        START
                    </button>
                </div>
            ) : question < QUESTIONS.length ? (
                <QuestionElement
                    question={QUESTIONS[question]}
                    nextQuestion={answer => {
                        console.log('data', answer);
                        if (answer !== 1000) {
                            setData([
                                ...data,
                                { question: QUESTIONS[question], answer: answer.answer, time: `${answer.time} sec` },
                            ]);
                        } else {
                            setData([
                                ...data,
                                { question: QUESTIONS[question], answer: 'TIMED OUT', time: 'TIMED OUT' },
                            ]);
                        }
                        setQuestion(question + 1);
                    }}
                />
            ) : (
                <div style={styles.startContainer}>
                    <div style={{ fontSize: 20 }}>{`Completed`}</div>
                    <div>
                        <CsvDownload filename="Participant.csv" style={styles.buttonStyle} data={data}>
                            DOWNLOAD RESULTS
                        </CsvDownload>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    answerContainer: {
        position: 'relative',
        backgroundColor: '#f6f6f6',
    },

    rod: {
        position: 'absolute',
        transformOrigin: 'center left',
        height: 2,
        borderRadius: 50,
    },

    resultContainer: {
        width: '100%',
        height: '100%',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },

    mainCircleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    mainCircle: {
        position: 'relative',
        backgroundColor: '#f2f2f2',
        border: `1px solid #bbb`,
        borderRadius: 1000,
    },

    childCircles: {
        position: 'absolute',
        backgroundColor: '#f2f2f2',
        border: `1px solid #aaa`,
        borderRadius: 10,
        height: 15,
        width: 15,
    },

    timer: {
        fontSize: 25,
        border: '1px solid #ddd',
        borderRadius: 60,
        padding: 6,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },

    questionContainer: {
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },

    movementResponseScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
    },

    titleContainer: {
        height: 60,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
    },

    startContainer: {
        maxWidth: 800,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: 400,
        padding: 30,
        marginTop: 20,
        paddingTop: '10%',
        backgroundColor: '#f3f3f3',
    },

    buttonStyle: {
        cursor: 'pointer',
        padding: 10,
        fontSize: 20,
        border: '1px solid #32CD32',
        backgroundColor: '#32CD32',
        borderRadius: 5,
        color: '#fff',
    },
};

export default App;
