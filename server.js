import {ApolloServer, gql} from "apollo-server";
import fetch from "node-fetch";

let tweets = [
    {
        id: "1",
        text: "first one",
        userId: "2"
    },
    {
        id: "2",
        text: "second one",
        userId: "1"
    }
];

let users = [
    {
        id: "1",
        firstName: "Boramm",
        lastName: "No"
    },
    {
        id: "2",
        firstName: "ddddd",
        lastName: "dddd"
    }
];

const typeDefs = gql`
    type User {
        id: ID! 
        userName: String!
        firstName: String!
        lastName: String!
        """
        Is the sum of firstName + lastName as a string
        """
        fullName: String!
    }
    """
    Tweet object represents a resource for a Tweet
    """
    type Tweet {
        id: ID!
        text: String!
        author: User
    }
    # Query type은 모든 Graph QL 서버에서 필수로 작성되어야 하는 타입 (GET)
    type Query {
        allMovies: [Movie!]!
        allUsers: [User!]!
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
        movie(id: String!): Movie
    }
    # Mutation type은 data의 변형이 있을 때 참조 (POST, PUT, DELETE)
    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet!
        """
        Delete a Tweet if found, else returns false
        """
        deleteTweet(id: ID!): Boolean!
    }
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String!]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }
`

const resolvers = {
    Query: {
        allMovies(){
            return fetch("https://yts.mx/api/v2/list_movies.json")
            .then((res) => res.json())
            .then((json) => json.data.movies);
        },
        movie(_, {id}){
            return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
            .then((res) => res.json())
            .then((json) => json.data.movie);
        },
        allUsers(){
            console.log("called users");
            return users;
        },
        allTweets(){
            return tweets;
        },
        tweet(root, {id}){
            return tweets.find((tweet) => tweet.id === id);
        }
    },
    Mutation: {
        postTweet(_, {text, userId}){
            const newTweet = {
                id: tweets.length + 1,
                text
            }
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(_, {id}){
            const tweet = tweets.find((tweet) => tweet.id === id);
            if(!tweet) return false;
            tweets = tweets.filter((tweet) => tweet.id !== id);
            return true;
        }
    },
    User: {
        fullName({firstName}){
            return firstName;
        },
        fullName({firstName, lastName}){
            return `${firstName} ${lastName}`;
        }
    },
    Tweet: {
        author({userId}){
            return users.find((user) => user.id === userId);
        }
    }
}   

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`Running on ${url}`);
});