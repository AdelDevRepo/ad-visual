import React, { useState, useEffect } from 'react';
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
  Spinner,
  useColorMode,
  useColorModeValue,
  IconButton,
  Flex,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, SearchIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'https://duqypsrtg1.execute-api.us-east-1.amazonaws.com/dev';

const MotionBox = motion(Box);

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");

  const generateImage = async () => {
    setIsGenerating(true);
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
        description: err.response?.data?.message || 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsGenerating(false);
  };

  const fetchGalleryImages = async (resetGallery = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: {
          term: searchTerm,
          page: resetGallery ? 1 : page,
          limit: 10,
          lastEvaluatedKey: resetGallery ? null : lastEvaluatedKey
        }
      });
      const newImages = response.data.items;
      setGalleryImages(prevImages => resetGallery ? newImages : [...prevImages, ...newImages]);
      setHasMore(response.data.hasMore);
      setLastEvaluatedKey(response.data.lastEvaluatedKey);
      if (resetGallery) {
        setPage(1);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error fetching images',
        description: 'An unexpected error occurred while fetching images',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGalleryImages(true);
  }, [searchTerm]);

  const loadMoreImages = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
      fetchGalleryImages();
    }
  };

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg={bgColor} py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Flex width="100%" justifyContent="space-between" alignItems="center">
              <Heading as="h1" size={["xl", "2xl"]}>AI Image Gallery</Heading>
              <IconButton
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
              />
            </Flex>
            
            <Tabs isFitted variant="enclosed" width="100%">
              <TabList mb="1em">
                <Tab>Generate Image</Tab>
                <Tab>Image Gallery</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <MotionBox
                    width="100%"
                    bg={cardBgColor}
                    p={[4, 6]}
                    borderRadius="md"
                    boxShadow="md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <VStack spacing={4}>
                      <Stack spacing={4} direction={["column", "row"]} width="100%">
                        <Input
                          placeholder="Enter a prompt to generate an image"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          flex={1}
                        />
                        <Button 
                          onClick={generateImage} 
                          colorScheme="blue" 
                          isLoading={isGenerating} 
                          loadingText="Generating"
                          isDisabled={!prompt}
                        >
                          Generate
                        </Button>
                      </Stack>
                      {isGenerating && <Spinner />}
                      {generatedImage && (
                        <Image src={generatedImage} alt="Generated image" maxH="300px" objectFit="contain" />
                      )}
                    </VStack>
                  </MotionBox>
                </TabPanel>
                <TabPanel>
                  <MotionBox
                    width="100%"
                    bg={cardBgColor}
                    p={[4, 6]}
                    borderRadius="md"
                    boxShadow="md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <VStack spacing={4}>
                      <Stack spacing={4} direction={["column", "row"]} width="100%">
                        <Input
                          placeholder="Search images"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          flex={1}
                        />
                        <IconButton
                          aria-label="Search images"
                          icon={<SearchIcon />}
                          onClick={() => fetchGalleryImages(true)}
                        />
                      </Stack>
                      <SimpleGrid columns={[1, 2, 3]} spacing={4} width="100%">
                        <AnimatePresence>
                          {galleryImages.map((image) => (
                            <MotionBox
                              key={image.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Box borderWidth={1} borderRadius="md" overflow="hidden">
                                <Image 
                                  src={image.imageUrl} 
                                  alt={image.prompt} 
                                  width="100%" 
                                  height={["150px", "200px"]} 
                                  objectFit="cover"
                                />
                                <Box p={2}>
                                  <Text fontSize="sm">{image.prompt}</Text>
                                </Box>
                              </Box>
                            </MotionBox>
                          ))}
                        </AnimatePresence>
                      </SimpleGrid>
                      {hasMore && (
                        <Button
                          onClick={loadMoreImages}
                          isLoading={isLoading}
                          loadingText="Loading"
                          colorScheme="blue"
                        >
                          Show More
                        </Button>
                      )}
                    </VStack>
                  </MotionBox>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;