-- Clear bad market data records with zero population for ZIP 60625
DELETE FROM market_data 
WHERE zip_code = '60625' 
AND (population_data->>'total')::int = 0;