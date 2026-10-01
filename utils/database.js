import { Sequelize } from "sequelize";
import dotenv from "dotenv";

const envPath = process.env.NODE_ENV === "qa" ? ".env.qa" : ".env";
dotenv.config({ path: envPath });

let sequelize;

if(process.env.NODE_ENV === "development") {
    sequelize = new Sequelize({
        dialect: process.env.DB_DIALECT,
        storage: process.env.DB_STORAGE,
        logging: false
    });
} else{
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            dialect: process.env.DB_DIALECT,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            logging: false
        }
    );
}
export default sequelize;