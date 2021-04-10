import * as Yup from 'yup';
import User from '../models/User';

class UserController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fail' });
        }

        const userExists = await User.findOne({
            where: { email: req.body.email },
        });
        if (req.body.password_hash) {
            return res
                .status(400)
                .json({ error: 'Password Hash is a bad request type' });
        }
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const { id, name, email, provider } = await User.create(req.body);
        return res.json({ id, name, email, provider });
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(6),
            password: Yup.string()
                .min(6)
                .when('oldPassword', (oldPassword, field) =>
                    oldPassword ? field.required() : field
                ),
            confirmPassword: Yup.string().when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            ),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fail' });
        }

        const { email, oldPassword } = req.body;
        const user = await User.findByPk(req.userId);
        // verify if it want to change e-mail
        if (email !== user.email) {
            // verify if we have any user using this e-mail
            const userExists = await User.findOne({ where: { email } });
            if (userExists) {
                return res.status(400).json({ error: 'User already exists' });
            }
        }

        if (oldPassword && !(await user.checkPassword(oldPassword))) {
            return res.status(401).json({ error: 'Password does not match.' });
        }

        const { id, name, provider } = await user.update(req.body);
        return res.json({ id, name, email, provider });
    }
}

export default new UserController();
