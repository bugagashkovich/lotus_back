import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { EventEmitter } from "events";
import { DateTime } from "luxon";

const typeDefs = `#graphql
  type User {
    id: ID,
    name: String,
  }

  type Session {
    users: [User],
    activeUserIndex: Int,
    nextTimeStep: Float
  }

  type Query {
    session: Session
    users: [User]
  }
`;

let users = [
  {
    id: 1,
    name: "Участник 1",
  },
  {
    id: 2,
    name: "Участник 2",
  },
  {
    id: 3,
    name: "Участник 3",
  },
  {
    id: 4,
    name: "Участник 4",
  },
  {
    id: 5,
    name: "Участник 5",
  },
];

let session = {
  users,
  turnDuration: 2 * 60 * 1000,
  activeUserIndex: 0,
  nextTimeStep: null,
};

const resolvers = {
  Query: {
    session: () => session,
    users: () => users,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);

let emitter = new EventEmitter();

emitter.on("startSession", () => {
  session.activeUserIndex = 0;
  session.nextTimeStep = DateTime.local().plus({
    milliseconds: session.turnDuration,
  });
  setTimeout(() => emitter.emit("nextUser"), session.turnDuration);
});

emitter.on("nextUser", () => {
  if (session.activeUserIndex === session.users.length - 1) {
    session.activeUserIndex = 0;
    session.nextTimeStep = session.nextTimeStep.plus({
      milliseconds: session.turnDuration,
    });
  } else {
    session.activeUserIndex += 1;
    session.nextTimeStep = session.nextTimeStep.plus({
      milliseconds: session.turnDuration,
    });
  }
  setTimeout(() => emitter.emit("nextUser"), session.turnDuration);
});

emitter.emit("startSession");
