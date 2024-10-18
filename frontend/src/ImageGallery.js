import React, { useState } from 'react';
import { Box, Image, SimpleGrid, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Text, useColorModeValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const MotionBox = motion(Box);

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const bgColor = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.8)");
  const textColor = useColorModeValue("black", "white");

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <Box>
      <SimpleGrid columns={[2, 3, 4, 5]} spacing={4}>
        <AnimatePresence>
          {images.map((image) => (
            <MotionBox
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleImageClick(image)}
              cursor="pointer"
              className="group relative overflow-hidden rounded-lg"
              height="0"
              paddingBottom="100%"
            >
              <Box className="absolute inset-0">
                <LazyLoadImage
                  src={image.imageUrl}
                  alt={image.prompt}
                  effect="blur"
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
                <Box
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-end justify-center opacity-0 group-hover:opacity-100"
                >
                  <Text className="text-white text-sm p-2 text-center">{image.prompt}</Text>
                </Box>
              </Box>
            </MotionBox>
          ))}
        </AnimatePresence>
      </SimpleGrid>

      <Modal isOpen={selectedImage !== null} onClose={handleCloseModal} size="xl">
        <ModalOverlay className="backdrop-blur-sm" />
        <ModalContent bg="transparent">
          <ModalCloseButton color={textColor} className="hover:rotate-90 transition-transform duration-300" />
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <ModalBody p={0} position="relative">
              <Image
                src={selectedImage?.imageUrl}
                alt={selectedImage?.prompt}
                objectFit="contain"
                w="100%"
                h="auto"
                maxH="80vh"
                className="rounded-lg shadow-2xl"
              />
              <Box
                position="absolute"
                bottom="4"
                right="4"
                bg={bgColor}
                color={textColor}
                p="2"
                borderRadius="md"
                maxW="80%"
                className="backdrop-filter backdrop-blur-md bg-opacity-70"
              >
                <Text fontSize="sm">{selectedImage?.prompt}</Text>
              </Box>
            </ModalBody>
          </MotionBox>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageGallery;