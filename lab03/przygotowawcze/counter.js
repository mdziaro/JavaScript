// Komponent Counter
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: parseInt(props.initial),
            intervalId: null
        };
    }

    startCounter = () => {
        const { delay } = this.props;
        const intervalId = setInterval(() => {
            this.setState((prevState) => ({ count: prevState.count + 1 }));
        }, parseInt(delay));

        this.setState({ intervalId });
    };

    stopCounter = () => {
        const { intervalId } = this.state;
        clearInterval(intervalId);
    };

    render() {
        const { count } = this.state;
        return (
            <div style={{ background: 'lightgreen', padding: '10px', margin: '10px' }}>
                <h3>Counter→</h3>
                <output style={{ fontSize: '4vh', color: 'red' }}>{count}</output>
                <br />
                <button onClick={this.startCounter}>Start</button>
                <button onClick={this.stopCounter}>Stop</button>
            </div>
        );
    }
}
