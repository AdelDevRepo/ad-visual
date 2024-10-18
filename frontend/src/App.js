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
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1" />
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            AI Image Gallery
          </h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'generate' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('generate')}
            >
              Generate Image
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'gallery' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('gallery')}
            >
              Image Gallery
            </button>
          </div>
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <label className="absolute left-10 top-0.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:top-0.5 peer-focus:text-gray-600 peer-focus:text-sm">
                    Enter a prompt
                  </label>
                  <Input
                    placeholder="Enter a prompt to generate an image"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    flex={1}
                    className="peer placeholder-transparent pt-4"
                  />
                  <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt}
                  className={`px-4 py-2 rounded-md bg-blue-500 text-white ${isGenerating || !prompt ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {isGenerating && <div className="text-center">Generating image...</div>}
              {generatedImage && (
                <img src={generatedImage} alt="Generated image" className="max-h-[300px] object-contain mx-auto rounded-lg shadow-xl" />
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <label className="absolute left-10 top-0.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:top-0.5 peer-focus:text-gray-600 peer-focus:text-sm">
                    Search images
                  </label>
                  <Input
                    placeholder="Search images"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    flex={1}
                    className="peer placeholder-transparent pt-4"
                  />
                  <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={() => fetchGalleryImages(true)}
                  className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                >
                  <SearchIcon className="w-6 h-6" />
                </button>
              </div>
              <ImageGallery images={galleryImages} darkMode={darkMode} />
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={loadMoreImages}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md bg-blue-500 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                  >
                    {isLoading ? 'Loading...' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </MotionDiv>
      </div>
    </div>
  );
}

export default App;