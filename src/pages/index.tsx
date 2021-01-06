import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import './styles.css'

const GET_TODO = gql`
	query {
		todos {
			id
			task
			status
		}
	}
`;

const ADD_TODO = gql`
	mutation addTodo($task: String!) {
		addTodo(task: $task) {
			task
		}
	}
`;

const UPDATE_TODO = gql`
	mutation updateTodo($id: ID!, $task: String!) {
		updateTodo(id: $id, task: $task) {
			id
			task
		}
	}
`;

const DELETE_TODO = gql`
	mutation deleteTodo($id: ID!) {
		deleteTodo(id: $id) {
			task
		}
	}
`;

const Home = () => {
	const [ addTodo ] = useMutation(ADD_TODO);
	const [ updateTodo ] = useMutation(UPDATE_TODO);
	const [ deleteTodo ] = useMutation(DELETE_TODO);

	const [ inputTask, setInputTask ] = useState<any>('');

	const addTask = () => {
			addTodo({
				variables: {
					task: inputTask.value
				},
				refetchQueries: [ { query: GET_TODO } ]
			});
			setInputTask('');

	};

	const deleteTask = (id) => {
		deleteTodo({
			variables: {
				id
			},
			refetchQueries: [ { query: GET_TODO } ]
		});
	};

	const updateTask = (id) => {
		var taskInput = prompt('Update Task');
		updateTodo({
			variables: {
				id: id,
				task: taskInput
			},
			refetchQueries: [ { query: GET_TODO } ]
		});
	};

	const { loading, error, data } = useQuery(GET_TODO);

	if (loading) return <h2>Loading..</h2>;

	if (error) {
		console.log(error);
		return <h2>Error</h2>;
	}

	return (
		<div className="container">
			<div className="form">
				<h1>TO-DO LIST</h1>
				<input
					type="text"
					ref={(node) => {
						setInputTask(node);
					}}
				/>

				<button className="add_button" onClick={addTask}>Add Task</button>
			</div>
			<div className="tasksBoard">
				<ul>
					{data.todos.map((todo) => {
						return (
							<li key={todo.id}>
								<div>
									<span>{todo.task}</span>
									{/* <span>{todo.status.toString()}</span> */}
								</div>
								<div>
									<button className="delete_button" onClick={() => deleteTask(todo.id)}>Delete</button>
									<button className="update_button" onClick={() => updateTask(todo.id)}>Update</button>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
};

export default Home;
