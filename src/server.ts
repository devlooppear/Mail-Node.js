import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const getHtmlTemplate = (variables: { [key: string]: string }): string => {
    const templatePath = path.join(__dirname, 'templates', 'email', 'email-template.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    for (const key in variables) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    }

    return template;
};

app.post('/send-email', async (req: Request, res: Response) => {
    const { to, subject, name, message } = req.body;

    try {
        const htmlContent = getHtmlTemplate({ name, message });

        const info = await transporter.sendMail({
            from: `"Sender Name" <${process.env.EMAIL_USER}>`,
            to, 
            subject,
            html: htmlContent 
        });

        res.status(200).json({ message: 'E-mail enviado!', info });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao enviar e-mail', error });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
