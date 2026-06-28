const {createClient} = require('redis');

class RedisSingleton {
    constructor() {
        if (!RedisSingleton.instance) {
            this.client = createClient({ url: process.env.URL_CACHE });
            this.client.on('error', (err) => console.error('Redis Client Error', err));
            
            this.client.connect().then(() => {
                console.log('🚀 Instância única do Redis conectada!');
            });

            RedisSingleton.instance = this;
        }

        return RedisSingleton.instance;
    }

    getClient() {
        return this.client;
    }
}

const redisInstance = new RedisSingleton().getClient();

module.exports = {redisInstance};