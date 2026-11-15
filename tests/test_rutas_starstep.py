"""Comprobar las rutas Flask sin alterar la base local."""
import unittest
from app import app

class StarStepRoutes(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
    def test_pages(self):
        for route in ('/', '/astronauta', '/despegue', '/luna', '/marte', '/huellas', '/bitacora', '/archivo-nasa', '/diagnostico', '/api/health'):
            with self.subTest(route=route):
                result = self.client.get(route)
                self.assertEqual(result.status_code, 200)
    def test_health(self):
        self.assertEqual(self.client.get('/api/health').json['status'], 'ok')

if __name__ == '__main__': unittest.main()
