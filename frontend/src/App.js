import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Image,
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
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, SearchIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import ImageGallery from './ImageGallery';
import { getFromCache, setInCache } from './utils/cache';

const API_URL = 'https://duqypsrtg1.execute-api.us-east-1.amazonaws.com/dev';

const MotionBox = motion(Box);

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [hasMore, setHasMore] = useState(true);
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

  const fetchGalleryImages = async (reset = false) => {
    setIsLoading(true);
    const cacheKey = `gallery_${searchTerm}_${lastEvaluatedKey}`;
    const cachedImages = getFromCache(cacheKey);

    if (cachedImages && !reset) {
      setGalleryImages(prevImages => [...prevImages, ...cachedImages]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/gallery`, {
        params: {
          limit: 20,
          lastEvaluatedKey: reset ? null : lastEvaluatedKey,
          term: searchTerm,
        }
      });
      const newImages = response.data.items;
      setGalleryImages(prevImages => reset ? newImages : [...prevImages, ...newImages]);
      setLastEvaluatedKey(response.data.lastEvaluatedKey);
      setHasMore(response.data.hasMore);
      setInCache(cacheKey, newImages);
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
      fetchGalleryImages();
    }
  };

  return (
    <Box minHeight="100vh" bg={bgColor} py={8} className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100">
      <Container maxW="container.xl">
        <VStack spacing={8}>
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Heading as="h1" size={["xl", "2xl"]} className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
              AI Image Gallery
            </Heading>
            <IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              aria-label="Toggle color mode"
              className="hover:rotate-12 transition-transform duration-300"
            />
          </Flex>
          
          <Tabs isFitted variant="enclosed" width="100%">
            <TabList mb="1em">
              <Tab className="hover:bg-opacity-80 transition-colors duration-300">Generate Image</Tab>
              <Tab className="hover:bg-opacity-80 transition-colors duration-300">Image Gallery</Tab>
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
                  className="backdrop-filter backdrop-blur-lg bg-opacity-30"
                >
                  <VStack spacing={4}>
                    <Stack spacing={4} direction={["column", "row"]} width="100%">
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                        <Input
                          placeholder="Enter a prompt to generate an image"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          flex={1}
                          className="peer placeholder-transparent"
                        />
                        <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                          Enter a prompt
                        </label>
                      </InputGroup>
                      <Button 
                        onClick={generateImage} 
                        colorScheme="blue" 
                        isLoading={isGenerating} 
                        loadingText="Generating"
                        isDisabled={!prompt}
                        className="hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Generate
                      </Button>
                    </Stack>
                    {isGenerating && <Spinner />}
                    {generatedImage && (
                      <Image src={generatedImage} alt="Generated image" maxH="300px" objectFit="contain" className="rounded-lg shadow-xl" />
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
                  className="backdrop-filter backdrop-blur-lg bg-opacity-30"
                >
                  <VStack spacing={4}>
                    <Stack spacing={4} direction={["column", "row"]} width="100%">
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                        <Input
                          placeholder="Search images"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          flex={1}
                          className="peer placeholder-transparent"
                        />
                        <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                          Search images
                        </label>
                      </InputGroup>
                      <IconButton
                        aria-label="Search images"
                        icon={<SearchIcon />}
                        onClick={() => fetchGalleryImages(true)}
                        className="hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      />
                    </Stack>
                    <ImageGallery images={galleryImages} />
                    {hasMore && (
                      <Button
                        onClick={loadMoreImages}
                        isLoading={isLoading}
                        loadingText="Loading"
                        colorScheme="blue"
                        className="hover:shadow-lg transform hover:scale-105 transition-all duration-300"
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
  );
}

export default App;