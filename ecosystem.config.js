module.exports = {
    apps: [
        {
            name: "main",
            script: "dist/main.js",
            node_args: "--max-old-space-size=4096",
            env: {
                NODE_ENV: "production",
                AYRSHARE_API_KEY: "TH8S6RT-67ZMT2F-HTB3ZSH-PFEAPER",
                PORT: 443,
                DB_USERNAME: "Postbet_owner",
                DB_PASSWORD: "PNCSlfK01sWg",
                DB_HOST: "ep-bitter-resonance-a21o6up7.eu-central-1.aws.neon.tech",
                DB_PORT: 5432,
                DB_NAME: "Postbet",
                DB_SSL: true,
                REDIRECT_URL: "https://postbet.ae/plans/subscribe/renderConfirm",
                MAIL_HOST: "smtp.gmail.com",
                SMTP_USERNAME: "husseinfayed86@gmail.com",
                SMTP_PASSWORD: "kclf dmaa aaqf hmik",
                SK_PAYTAPS: "Bearer sk_live_kdhx6S9KfY0l5ZBL8aGCQRDy",
                MERCHANT_ID: 30634006,
                SK_STABILITY:"sk-dJ8MWrjUqcckn9uczBtzORkWswAAYVgIMjOGxboYEknqjCr2"
            },
        },
    ],
};
