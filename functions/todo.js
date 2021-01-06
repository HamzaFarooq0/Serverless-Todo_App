const { ApolloServer, gql } = require('apollo-server-lambda');

var faunadb = require('faunadb'),
	q = faunadb.query;

require('dotenv').config();

const typeDefs = gql`
	type Query {
		todos: [Todo!]
	}

	type Todo {
		id: ID!
		task: String!
		status: Boolean!
	}

	type Mutation {
		addTodo(task: String!): Todo
		deleteTodo(id: ID!): Todo
		updateTodo(id: ID!, task: String!): Todo
	}
`;

const resolvers = {
	Query: {
		todos: async () => {
			try {
				//Connecting to FaunaDB
				var adminClient = new faunadb.Client({ secret: process.env.FAUNA_DB_SECRET });

				//Getting Data from faunadb
				const response = await adminClient.query(
					q.Map(q.Paginate(q.Match(q.Index('task'))), q.Lambda((x) => q.Get(x)))
				);

				return response.data.map((d) => {
					return {
						id: d.ref.id,
						status: d.data.status,
						task: d.data.task
					};
				});
			} catch (error) {
				console.log(error);
			}
		}
	},

	Mutation: {
		addTodo: async (_, { task }) => {
			try {
				//Connecting to FaunaDB
				var adminClient = new faunadb.Client({ secret: process.env.FAUNA_DB_SECRET });

				//Create Task in FaunaDB
				const response = await adminClient.query(
					q.Create(q.Collection('todos'), { data: { task: task, status: true } })
				);

				return response.ref.data;
			} catch (error) {
				console.log(error);
			}
		},

		deleteTodo: async (_, { id }) => {
			try {
				//Connecting to FaunaDB
				var adminClient = new faunadb.Client({ secret: process.env.FAUNA_DB_SECRET });

				//Delete Task in FaunaDB
				const response = await adminClient.query(q.Delete(q.Ref(q.Collection('todos'), id)));
				console.log(response);
			} catch (error) {
				console.log(error);
			}
		},

		updateTodo: async (_, { id, task }) => {
			try {
				//Connecting to FaunaDB
				var adminClient = new faunadb.Client({ secret: process.env.FAUNA_DB_SECRET });

				//Update Task in FaunaDB
				const response = adminClient.query(q.Update(q.Ref(q.Collection('todos'), id), { data: { task } }));

				console.log(response);
			} catch (error) {
				console.log(error);
			}
		}
	}
};

const server = new ApolloServer({
	typeDefs,
	resolvers
});

exports.handler = server.createHandler();
