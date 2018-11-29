import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { graphqlMutation } from 'aws-appsync-react';
import { buildSubscription } from 'aws-appsync'

const SubscribeToTodos = gql`
  subscription onCreateTodo {
    onCreateTodo {
      id
      title
      completed
    }
  }
`;

const ListTodos = gql`
  query listTodos {
    listTodos {
      items {
        id
        title
        completed
      }
    }
  }
`;
const CreateTodo = gql`
  mutation($title: String!, $completed: Boolean) {
    createTodo(input: {
      title: $title
      completed: $completed
    }) {
      id title completed
    }
  }
`;
class App extends Component {
  state = { todo: '' };
  componentDidMount() {
    this.props.data.subscribeToMore(
      buildSubscription(SubscribeToTodos, ListTodos)
    )
  }
  addTodo = () => {
    if (this.state.todo === '' ) return;
    const todo = {
      title: this.state.todo,
      completed: false,
    };
    this.props.createTodo(todo);
    this.setState({ todo: '' })
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <input
          onChange={e => this.setState({ todo: e.target.value })}
          value={this.state.todo}
          placeholder='Todo name'
        />
        <button onClick={this.addTodo}>Add Todo</button>
        {
          this.props.todos.map((todo) => (
            <p key={todo.id}>
              {todo.title}
            </p>
          ))
        }
      </div>
    );
  }
}

export default compose(
  graphqlMutation(CreateTodo, ListTodos, 'Todo'),
  graphql(ListTodos, {
    options: {
      fetchPolicy: 'cache-and-network'
    },
    props: props => ({
      subscribeToMore: props.data.subscribeToMore,
      todos: props.data.listTodos ? props.data.listTodos.items : [],
      data: props.data
    })
  })
)(App)