// 기존 import 유지
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import RandomRecipe from '../components/RandomRecipe';
import { useTranslation } from 'react-i18next';

function HomePage() {
    const [recipes, setRecipes] = useState([]);
    const [randomRecipe, setRandomRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState('latest');
    const [searchTerm, setSearchTerm] = useState('');
    const [tip, setTip] = useState(''); // 오늘의 팁 상태 추가
    const { t } = useTranslation();

    useEffect(() => {
        const fetchAndSetRecipes = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(apiUrl);
                const initialRecipes = response.data.sort((a, b) => parseInt(b.id) - parseInt(a.id));
                setRecipes(initialRecipes);
                if (initialRecipes.length > 0) {
                    setRandomRecipe(initialRecipes[Math.floor(Math.random() * initialRecipes.length)]);
                }

                // 오늘의 팁 랜덤 선택 (예시: recipes에서 tip 필드가 있을 때)
                if (response.data.length > 0) {
                    const randomTip = response.data[Math.floor(Math.random() * response.data.length)].tip || t("오늘의 요리 팁을 확인해보세요!");
                    setTip(randomTip);
                }

            } catch (error) {
                console.error(t("레시피 데이터를 불러오는 데 실패했습니다."), error);
            } finally {
                setLoading(false);
            }
        };
        fetchAndSetRecipes();
    }, [t]);

    const recommendRandomRecipe = useCallback(() => {
        if (recipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * recipes.length);
            setRandomRecipe(recipes[randomIndex]);
        }
    }, [recipes]);

    const handleCardClick = (id) => navigate(`/recipe/${id}`);
    const handleSearchChange = (event) => setSearchTerm(event.target.value);

    const filteredAndSortedRecipes = useMemo(() => {
        const filtered = recipes.filter(recipe =>
            recipe.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        let sorted = [...filtered];
        switch (sortOrder) {
            case 'popularity':
                sorted.sort((a, b) => parseInt(b.id) * 2 - parseInt(a.id) * 2);
                break;
            case 'rating':
                sorted.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                break;
            case 'reviews':
                sorted.sort((a, b) => parseInt(a.id) * 2 - parseInt(b.id) * 2);
                break;
            case 'latest':
            default:
                sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));
                break;
        }
        return sorted;
    }, [recipes, sortOrder, searchTerm]);

    if (loading) {
        return <div className="text-center py-20 text-brand-dark font-semibold">{t("맛있는 레시피를 불러오는 중...")}</div>;
    }

    return (
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <header className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary">{t("오늘 뭐 먹지?")}</h1>
                <p className="text-text-secondary mt-3 text-lg">{t("버튼을 눌러 오늘의 특별한 레시피를 추천받아보세요!")}</p>
            </header>

            {randomRecipe && <RandomRecipe recipe={randomRecipe} onClick={() => handleCardClick(randomRecipe.id)} />}


            <div className="text-center my-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button onClick={recommendRandomRecipe} className="bg-brand-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
                    🔄 {t("다른 레시피 추천!")}
                </button>
                <button onClick={() => navigate('/add-recipe')} className="bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-emerald-600 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
                    ✨ {t("레시피 추가하기")}
                </button>
            </div>

            <section className="mt-16">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-text-primary">{t("모든 레시피")}</h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder={t("레시피 이름으로 검색...")}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark w-full sm:w-48"
                        />
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark w-full sm:w-auto">
                            <option value="latest">{t("최신순")}</option>
                            <option value="popularity">{t("인기순")}</option>
                            <option value="rating">{t("평점순")}</option>
                            <option value="reviews">{t("리뷰 많은 순")}</option>
                        </select>
                    </div>
                </div>

                {filteredAndSortedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredAndSortedRecipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => handleCardClick(recipe.id)} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-text-secondary py-16">
                        {searchTerm ? `"${searchTerm}" ${t("에 대한 검색 결과가 없습니다.")}` : t("표시할 레시피가 없습니다.")}
                    </p>
                )}
            </section>
        </main>
    );
}

export default HomePage;
