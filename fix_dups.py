import asyncio
from sqlalchemy import create_engine, text
import os

# Connect to Neon DB
# I don't have the neon connection string easily accessible in python without dotenv.
# Let's just create a JS script and run it using npx tsx.
