import React, { useState } from 'react';
import { Box, Image, SimpleGrid, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

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
            >
              <Image
                src={image.imageUrl}
                alt={image.prompt}
                objectFit="cover"
                w="100%"
                h="100%"
                borderRadius="md"
              />
            </MotionBox>
          ))}
        </AnimatePresence>
      </SimpleGrid>

      <Modal isOpen={selectedImage !== null} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0} position="relative">
            <Image
              src={selectedImage?.imageUrl}
              alt={selectedImage?.prompt}
              objectFit="contain"
              w="100%"
              h="auto"
              maxH="80vh"
            />
            <Box
              position="absolute"
              bottom="4"
              right="4"
              bg="rgba(255, 255, 255, 0.8)"
              color="black"
              p="2"
              borderRadius="md"
              maxW="80%"
            >
              <Text fontSize="sm">{selectedImage?.prompt}</Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageGallery;