// src/components/Navbar.jsx
import { Box, Flex, HStack, Link, IconButton, useDisclosure, useColorModeValue, Stack, Button, useColorMode, Image } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth.js';
import logo from '../assets/logo.png';
import axios from 'axios';

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('gray.100', 'gray.900');
  const hoverBg = useColorModeValue('gray.200', 'gray.700');
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await window.open('http://localhost:8080/api/auth/logout', '_self');
    setUser(null);
    navigate('/');
  };

  const NavLink = ({ children }) => (
    <Link
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: hoverBg,
      }}
      as={RouterLink}
      to={`/${children.toLowerCase()}`}>
      {children}
    </Link>
  );

  return (
    <Box bg={bg} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Image src={logo} width={"40px"} />
          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}>
            <NavLink>Home</NavLink>
            {user && (
              <Button
                px={2}
                py={1}
                rounded={'md'}
                _hover={{
                  textDecoration: 'none',
                  bg: hoverBg,
                }}
                onClick={handleLogout}>
                Logout
              </Button>
            )}
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          <Button onClick={toggleColorMode} mr={4}>
            Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
          </Button>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            <NavLink>Home</NavLink>
            {user && (
              <Button
                px={2}
                py={1}
                rounded={'md'}
                _hover={{
                  textDecoration: 'none',
                  bg: hoverBg,
                }}
                onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navbar;
