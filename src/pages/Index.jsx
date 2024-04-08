import { useState, useEffect } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { FaSpinner } from "react-icons/fa";

const KVDB_BUCKET = "CFh5eziuGXnwmYdXC6iiEt";
const LOBBY_NAMESPACE = "lobby";
const GAMES_NAMESPACE = "games";

const Index = () => {
  const [userId, setUserId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Generate a unique user ID
    const id = Math.random().toString(36).substring(7);
    setUserId(id);
  }, []);

  const joinLobby = async () => {
    setIsSearching(true);
    // Add the user to the lobby
    await fetch(`https://kvdb.io/${KVDB_BUCKET}/${LOBBY_NAMESPACE}/${userId}`, {
      method: "POST",
    });
    // Start searching for a match
    searchForMatch();
  };

  const searchForMatch = async () => {
    // Check the lobby for waiting players
    const response = await fetch(`https://kvdb.io/${KVDB_BUCKET}/${LOBBY_NAMESPACE}?limit=2`);
    const players = await response.json();

    if (players.length === 2) {
      // Remove the players from the lobby
      await Promise.all(
        players.map((player) =>
          fetch(`https://kvdb.io/${KVDB_BUCKET}/${LOBBY_NAMESPACE}/${player.key}`, {
            method: "DELETE",
          }),
        ),
      );
      // Create a new game
      const gameId = Math.random().toString(36).substring(7);
      setGameId(gameId);
      setGameState({
        player1: players[0].key,
        player2: players[1].key,
        // Initialize the game state
        // ...
      });
      setIsSearching(false);
    } else {
      // Keep searching for a match
      setTimeout(searchForMatch, 1000);
    }
  };

  const updateGameState = async (newState) => {
    // Update the game state in kvdb.io
    await fetch(`https://kvdb.io/${KVDB_BUCKET}/${GAMES_NAMESPACE}/${gameId}`, {
      method: "POST",
      body: JSON.stringify(newState),
    });
    setGameState(newState);
  };

  // Render the game UI based on the current state
  if (!userId) {
    return <Text>Generating user ID...</Text>;
  }

  if (isSearching) {
    return (
      <Flex direction="column" align="center">
        <FaSpinner className="spinner" />
        <Text>Searching for a match...</Text>
      </Flex>
    );
  }

  if (gameId && gameState) {
    // Render the game UI
    return (
      <Box>
        <Heading>Pong Game</Heading>
        {/* Render the game board */}
        {/* ... */}
      </Box>
    );
  }

  return (
    <Flex direction="column" align="center">
      <Heading>Welcome to Pong!</Heading>
      <Button onClick={joinLobby} mt={4}>
        Join Match
      </Button>
    </Flex>
  );
};

export default Index;
