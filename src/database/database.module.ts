import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forRoot('mongodb+srv://mquintana_db_user:nO6z59wFYKlcV01n@cluster0.pcciym8.mongodb.net/?appName=Cluster0')],
    exports: [MongooseModule],
})
export class DatabaseModule {}
