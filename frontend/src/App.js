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
  FormControl,
  FormLabel,
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
      const response = await axios.post(`${API_URL}/generate`, { prompt }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      setGeneratedImage(response.data.imageUrl);
      toast({
        title: "Image generated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error generating image",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchGalleryImages = async (isNewSearch = false) => {
    setIsLoading(true);
    try {
      const cacheKey = `gallery_${searchTerm}_${isNewSearch ? '0' : lastEvaluatedKey}`;
      const cachedData = getFromCache(cacheKey);

      if (cachedData) {
        setGalleryImages(isNewSearch ? cachedData.items : [...galleryImages, ...cachedData.items]);
        setLastEvaluatedKey(cachedData.lastEvaluatedKey);
        setHasMore(cachedData.hasMore);
      } else {
        const response = await axios.get(`${API_URL}/images`, {
          params: {
            term: searchTerm,
            lastEvaluatedKey: isNewSearch ? undefined : lastEvaluatedKey,
          },
          withCredentials: true
        });
        const newImages = response.data.items;
        setGalleryImages(isNewSearch ? newImages : [...galleryImages, ...newImages]);
        setLastEvaluatedKey(response.data.lastEvaluatedKey);
        setHasMore(response.data.hasMore);

        setInCache(cacheKey, response.data);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      toast({
        title: "Error fetching images",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreImages = () => {
    fetchGalleryImages();
  };

  useEffect(() => {
    fetchGalleryImages(true);
  }, []);

  return (
    <Box minHeight="100vh" bg={bgColor} py={8} className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100">
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Flex width="100%" justifyContent="space-between" alignItems="center" mb={8}>
            <Box flex="1" />
            <Heading as="h1" size={["xl", "2xl"]} className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
              AI Image Gallery
            </Heading>
            <Flex flex="1" justifyContent="flex-end">
              <IconButton
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
                className="hover:rotate-12 transition-transform duration-300"
              />
            </Flex>
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
                  <VStack spacing={4} align="stretch">
                    <Stack spacing={4} direction={["column", "row"]} width="100%">
                      <FormControl>
                        <FormLabel htmlFor="prompt" className="sr-only">Enter a prompt</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.300" />
                          </InputLeftElement>
                          <Input
                            id="prompt"
                            placeholder="Enter a prompt to generate an image"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            paddingLeft="2.5rem"
                            paddingTop="1.5rem"
                            paddingBottom="0.5rem"
                          />
                          <Box
                            as="span"
                            pointerEvents="none"
                            color="gray.500"
                            fontSize="sm"
                            position="absolute"
                            left="2.5rem"
                            top="0.5rem"
                            transition="all 0.2s"
                            opacity={prompt ? 1 : 0}
                            transform={prompt ? 'translateY(0)' : 'translateY(15px)'}
                          >
                            Enter a prompt
                          </Box>
                        </InputGroup>
                      </FormControl>
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
                  <VStack spacing={4} align="stretch">
                    <Stack spacing={4} direction={["column", "row"]} width="100%">
                      <FormControl>
                        <FormLabel htmlFor="search" className="sr-only">Search images</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.300" />
                          </InputLeftElement>
                          <Input
                            id="search"
                            placeholder="Search images"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            paddingLeft="2.5rem"
                            paddingTop="1.5rem"
                            paddingBottom="0.5rem"
                          />
                          <Box
                            as="span"
                            pointerEvents="none"
                            color="gray.500"
                            fontSize="sm"
                            position="absolute"
                            left="2.5rem"
                            top="0.5rem"
                            transition="all 0.2s"
                            opacity={searchTerm ? 1 : 0}
                            transform={searchTerm ? 'translateY(0)' : 'translateY(15px)'}
                          >
                            Search images
                          </Box>
                        </InputGroup>
                      </FormControl>
                      <IconButton
                        aria-label="Search images"
                        icon={<SearchIcon />}
                        onClick={() => fetchGalleryImages(true)}
                        className="hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      />
                    </Stack>
                    <Box width="100%">
                      <ImageGallery images={galleryImages} />
                    </Box>
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