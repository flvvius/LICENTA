const { where } = require('sequelize');
const {task: TaskDB, task} = require('../models');
const {user: UserDb} = require('../models');
const {userTask: userTaskDB} = require('../models')

const controller = {

    add: async (req, res) => {
        const { taskToCreate, userIds } = req.body;
    
        if (!taskToCreate || !taskToCreate.titlu || taskToCreate.titlu.length === 0) {
            return res.status(400).json({ message: "no_title" });
        }
    
        if (!userIds || userIds.length === 0) {
            return res.status(400).json({ message: "no_user" });
        }
    
        const deadlineDate = new Date(taskToCreate.deadline);
        if (isNaN(deadlineDate.getTime())) {
            return res.status(400).json({ message: "no_date" });
        }
    
        const currentDate = new Date();
        if (deadlineDate.getTime() <= currentDate.getTime()) {
            return res.status(400).json({ message: "invalid_date" });
        }

        if (!taskToCreate.importanta) {
            return res.status(400).json({ message: "no_importanta" });
        }
    
        try {
            for (const userId of userIds) {
                const user = await UserDb.findByPk(userId);
                if (!user) {
                    return res.status(400).json({ message: "Nu exista user" });
                }
            }
    
            const createdTask = await TaskDB.create(taskToCreate);
            const { id } = createdTask;
    
            const userTaskPromises = userIds.map((userId) => {
                const userTaskObj = {
                    idUser: userId,
                    idTask: id
                };
                return userTaskDB.create(userTaskObj);
            });
    
            await Promise.all(userTaskPromises);
    
            return res.status(201).json({ message: "Ai asignat cu succes task-ul" });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
    

    getAll: async (req, res) => {
        try {
            const tasks = await TaskDB.findAll();
            return res.status(200).send(tasks);
        } catch (err) {
            return res.status(500).send(err.message);
        }
    },

    getTasksByIds: async (req, res) => {
        const ids = req.body.ids;
        try {
            const tasks = await TaskDB.findAll({
                where: {
                    id: ids
                }
            });
            res.status(200).send(tasks);
        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    getEsteTaskColectiv: async (req, res) => {

        const id = req.params.id;

        try {
            const persoaneCareAuTaskulAsignat = await userTaskDB.findAll({
                where: {
                    idTask: id
                }
            });
            if (persoaneCareAuTaskulAsignat.length > 0) {
                if (persoaneCareAuTaskulAsignat.length > 1) {
                    return res.status(200).json({message: "task colectiv"});
                } else {
                    return res.status(200).json({message: "task individual"});
                }
            } else {
                return res.status(400).json({message: "task neasignat!"});
            }
        } catch (err) {
            return res.status(500).send(err.message);
        }

    },

    getTaskById: async (req, res) => {
        const id = req.params.id;
        try {
            const task = await TaskDB.findByPk(id);
            res.status(200).send(task);
        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    getTasksByUser: async (req, res) => { // daca nu exista userul returneaza un array gol
        const idUser = req.params.id;

        await userTaskDB.findAll({
            where: {
                idUser: idUser
            }
        }).then(async (userTaskObjects) => {
            const taskIds = userTaskObjects.map(obj => obj.idTask);
            let tasks = [];

            for (id of taskIds) {
                let task = await TaskDB.findByPk(id);
                if (task) {
                    tasks.push(task)
                }
            }

            return res.status(200).send(tasks);
        }).catch((err) => {
            return res.status(500).send(err.message);
        })

    },

    getFinishedTasksByUser: async (req, res) => { // daca nu exista userul returneaza un array gol
        const idUser = req.params.id;

        await userTaskDB.findAll({
            where: {
                idUser: idUser
            }
        }).then(async (userTaskObjects) => {
            const taskIds = userTaskObjects.map(obj => obj.idTask);
            let tasks = [];

            for (id of taskIds) {
                let task = await TaskDB.findByPk(id);
                if (task && task.data_finalizare && new Date(task.data_finalizare).getTime() <= new Date(task.deadline).getTime()) {
                    tasks.push(task)
                }
            }

            return res.status(200).send(tasks);
        }).catch((err) => {
            return res.status(500).send(err.message);
        })

    },

    getUsersByTask: async (req, res) => {
        const idTask = req.params.id

        await userTaskDB.findAll({
            where: {
                idTask: idTask
            }
        }).then(async (userTaskObjects) => {
            const userIds = userTaskObjects.map(obj => obj.idUser);
            let users = [];

            for (id of userIds) {
                let user = await UserDb.findByPk(id);
                if (user) {
                    users.push(user)
                }
            }

            return res.status(200).send(users);
        }).catch((err) => {
            return res.status(500).send(err.message);
        })
    },

    update: async (req, res) => {
        const {id} = req.params;
        const payload = req.body;

        try {
            await TaskDB.update(payload, {
                where: {id: id}
            })
            return res.status(200).json({message: "Task updated successfully!"});
        } catch(err) {
            return res.status(500).send(err.message);
        }

    }
};

module.exports = controller;
