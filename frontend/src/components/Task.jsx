import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Text, VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useColorModeValue } from "@chakra-ui/react";
import Feedback from "./UserFeedback";
import User from "./User";
import { formatISO, parseISO } from 'date-fns';

const Task = ({ task, updateTask, user, esteColectiv }) => {
    const [localTask, setLocalTask] = useState(task);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const { isOpen: isUserOpen, onOpen: onUserOpen, onClose: onUserClose } = useDisclosure();

    const handleClick = async () => {
        const date = new Date();
        const updatedTask = { ...localTask, data_finalizare: formatISO(date) };
        setLocalTask(updatedTask);

        try {
            await updateTask(updatedTask);
        } catch (err) {
            console.error("error updating task: ", err);
        }
    };

    const handleFinalizeClick = () => {
        onConfirmOpen();
    };

    const handleConfirmFinalize = async () => {
        onConfirmClose();
        await handleClick();
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        onUserOpen();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/task/getUsersByTask/${localTask.id}`);
                setUsers(response.data);
            } catch(err) {
                console.log(err);
            }
        }

        fetchData();
    }, [localTask.id]);

    const bgColectiv = useColorModeValue("green.200", "#243325");
    const bg = useColorModeValue("gray.300", "gray.800");
    const btnColor = useColorModeValue("blue", "blue");
    const numeEchipa = useColorModeValue("black", "peachpuff");

    return (
        <Box p={5} borderWidth="1px" borderRadius="lg" shadow="md" backgroundColor={bg}>
            <VStack align="start" spacing={3}>
                <Text fontSize="md"><strong>Titlu:</strong> {localTask.titlu}</Text>
                <Text fontSize="md"><strong>Descriere:</strong> {localTask.descriere}</Text>
                <Text fontSize="md"><strong>Deadline:</strong> {localTask.deadline ? new Date(parseISO(localTask.deadline)).toLocaleString() : "Nefinalizat"}</Text>
                <Text fontSize="md"><strong>Importanta:</strong> {localTask.importanta}</Text>
                <Text fontSize="md"><strong>Data finalizare:</strong> {localTask.data_finalizare ? new Date(parseISO(localTask.data_finalizare)).toLocaleString() : "Nefinalizat"}</Text>
                {!user.esteAdmin && (
                    <>
                        {esteColectiv && <Box>
                            <Text fontSize="md"><strong>Echipa:</strong></Text>
                            {users.map((obj) => (
                                <Text key={obj.id} paddingLeft="25px" color={numeEchipa}>{obj.nume}</Text>
                            ))}
                        </Box>}

                        {localTask.data_finalizare ? null : (
                            <Button colorScheme={btnColor} onClick={handleFinalizeClick}>Finalizeaza</Button>
                        )}
                        <Box mt={3}>
                            <Button colorScheme={btnColor} onClick={onOpen}>Acorda feedback pentru acest task</Button>
                            <Feedback show={isOpen} onClose={onClose} userId={user.id} taskId={task.id} />
                        </Box>
                    </>
                )}
                {user.esteAdmin && (
                    <Box>
                        <Text fontSize="md"><strong>Users:</strong></Text>
                        {users.map((obj) => (
                            <Text key={obj.id} paddingLeft="25px" cursor="pointer" onClick={() => handleUserClick(obj)} color={numeEchipa}>{obj.nume}</Text>
                        ))}
                    </Box>
                )}
            </VStack>

            <Modal isOpen={isUserOpen} onClose={onUserClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>User Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedUser && <User user={selectedUser} />}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onUserClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Finalization</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>Are you sure you want to finalize this task?</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme={btnColor} mr={3} onClick={handleConfirmFinalize}>
                            Yes
                        </Button>
                        <Button variant="ghost" onClick={onConfirmClose}>No</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Task;
