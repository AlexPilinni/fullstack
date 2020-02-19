const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const keys = require('../config/keys');
const errorHandler = require('../utils/errorHandler');

module.exports.login = async (req, res) => {
    const candidate = await User.findOne({email: req.body.email});
    if(candidate){
        //Проверка пользователя, пользователь существует
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
        if(passwordResult) {
            //Генерация токена, пароли совпали
            const token = jwt.sign({
                email: candidate.email,
                id: candidate._id
            }, keys.jwt, {expiresIn: 3600});

            res.status(200).json({
                token: `Bearer ${token}`
            })
        }
        else {
            // пароли не совпали, ошибка
            res.status(401).json({
                message: 'Пароли не совпадают. Попробуйте снова'
            })
        }
    }
    else {
        // Пользователя нет, ошибка
        res.status(404).json({
            message: 'Пользователь с таким email не найден.'
        })
    }
};

module.exports.register = async (req, res) => {
   const candidate = await User.findOne({email: req.body.email});

    if (candidate) {
        // Пользвователь существует, нужно отдать ошибку
        res.status(409).json({
            message: 'Такой email  уже занят. Попробуйте другой.'
        })
    }
    else {
        // Нужно создать Пользователя
        const salt = bcrypt.genSaltSync(10);
        const password = req.body.password;

        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        });

        try {
            await user.save();
            res.status(201).json(user)
        } catch(error) {
            // Обработать ошибку
            errorHandler(res, error)
        }

    }
};
