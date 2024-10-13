import React, { useState } from 'react';
import axios from 'axios';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Image,
  Text,
  SimpleGrid,
  Container,
  useToast,
} from '@chakra-ui/react';

const API_URL = 'https://duqypsrtg1.execute-api.us-east-1.amazonaws.com/dev'; // API gateway 

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const generateImage = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/generate`, { prompt });
      setGeneratedImage(response.data.imageUrl);
      toast({
        title: 'Image generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error generating image',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const searchImages = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/search?term=${searchTerm}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error searching images',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg="gray.100" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading as="h1" size="2xl">AI Image Gallery</Heading>
            
            <Box width="100%" bg="white" p={6} borderRadius="md" boxShadow="md">
              <VStack spacing={4}>
                <Heading as="h2" size="lg">Generate Image</Heading>
                <Input
                  placeholder="Enter a prompt to generate an image"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button onClick={generateImage} colorScheme="blue" isLoading={isLoading}>
                  Generate
                </Button>
                {generatedImage && (
                  <Image src={generatedImage} alt="Generated image" maxH="300px" objectFit="contain" />
                )}
              </VStack>
            </Box>

            <Box width="100%" bg="white" p={6} borderRadius="md" boxShadow="md">
              <VStack spacing={4}>
                <Heading as="h2" size="lg">Search Images</Heading>
                <Input
                  placeholder="Enter search term"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={searchImages} colorScheme="green" isLoading={isLoading}>
                  Search
                </Button>
                <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                  {searchResults.map((result) => (
                    <Box key={result.id} borderWidth={1} borderRadius="md" overflow="hidden">
                      <Image src={result.imageUrl} alt={result.prompt} />
                      <Box p={2}>
                        <Text fontSize="sm">{result.prompt}</Text>
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;