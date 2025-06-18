// services/metrics.js
import { Registry, Counter, Histogram } from 'prom-client';

const register = new Registry();

// Histogramme pour la durée des requêtes HTTP
export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Durée des requêtes HTTP en secondes',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.05, 0.1, 0.5, 1, 2, 5] // temps en secondes
});
register.registerMetric(httpRequestDuration);

// Compteur de cache HIT
export const cacheHitCounter = new Counter({
    name: 'cache_hit_total',
    help: 'Nombre total de HIT cache'
});
register.registerMetric(cacheHitCounter);

// Compteur de cache MISS
export const cacheMissCounter = new Counter({
    name: 'cache_miss_total',
    help: 'Nombre total de MISS cache'
});
register.registerMetric(cacheMissCounter);

// Exporter le registre
export { register };
