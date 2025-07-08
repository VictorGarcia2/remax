import unittest
from valuador import calcular_estadisticas

class TestValuador(unittest.TestCase):
    def test_calculo_basico(self):
        comparables = [
            {'precio': 2000000, 'metros': 100},
            {'precio': 2500000, 'metros': 120},
            {'precio': 1800000, 'metros': 90},
        ]
        resultado = calcular_estadisticas(
            comparables,
            size=110,
            address="Calle Falsa 123",
            property_type="departamento",
            bedrooms=2,
            bathrooms=2,
            age="6-10",
            condition="bueno",
            amenities=["gimnasio"],
            contact_info={"name": "Juan"}
        )
        self.assertGreater(resultado['average'], 0)
        self.assertGreater(resultado['valuePerSqMeter'], 0)
        self.assertEqual(resultado['size'], 110)
        self.assertEqual(resultado['propertyType'], "departamento")

    def test_sin_comparables(self):
        resultado = calcular_estadisticas([], size=100)
        self.assertEqual(resultado, {})

    def test_valores_extremos(self):
        comparables = [
            {'precio': 100000, 'metros': 10},   # 10,000 por m2
            {'precio': 200000, 'metros': 10},   # 20,000 por m2
        ]
        resultado = calcular_estadisticas(comparables, size=500)
        self.assertTrue(resultado['average'] > 0)
        self.assertTrue(resultado['min_m2'] < resultado['max_m2'])

if __name__ == "__main__":
    unittest.main() 