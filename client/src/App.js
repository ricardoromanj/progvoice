import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';

// import logo from './logo.svg';
import './App.css';

import Calls from './components/Calls';

import { 
  Grid,
  Container,
  Icon,
  Header
} from 'semantic-ui-react';

class App extends Component {

  constructor() {
    super()

    this.state = {
      endpoint: 'http://localhost:8020',
      calls: [],
      socket: undefined
    };
  }

  componentDidMount() {
    const socket = socketIOClient(this.state.endpoint, { reconnection: true });

    socket.on('load-data', (data) => {
      this.handleLoadCalls(data);
    });

    socket.on('update-data', (data) => {
      if (data.call) {
        this.handleAddCall(data.call);
      } else {
        this.handleDeleteCalls();
      }
    });

   this.setState(() => ({
      endpoint: 'http://localhost:8020',
      calls: [],
      socket: socket
    }));

  }

  handleLoadCalls = (calls) => {
    this.setState(() => ({
      calls: calls
    }));
  };

  handleAddCall = (call) => {
    this.setState((prevState) => ({
      calls: prevState.calls.concat(call)
    }));
  };

  handleDeleteCalls = () => {
    this.setState(() => ({
      calls: []
    }));
  };

  render() {

    return (
      <div>
        <Grid columns={1} padded>
          <Grid.Column>
            <Container>
              <Header as='h2' icon>
                <Icon name='call' />
                Programmable Voice Example
              </Header>
              <Calls 
                calls={this.state.calls}
              />
            </Container>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default App;
