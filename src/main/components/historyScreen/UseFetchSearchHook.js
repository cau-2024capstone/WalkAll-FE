import { useState, useEffect } from 'react';

const useFetchSearch = (keyword) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!keyword) return;

        const fetchData = async () => {
            setIsLoading(true);
            setIsError(false);

            // 실제 요청 대신 모의 데이터사용
            try {
                const mockData = {
                    results: [
                        { id: 1, name: "Sample Place 1", description: "This is a sample description for Place 1" },
                        { id: 2, name: "Sample Place 2", description: "This is a sample description for Place 2" },
                        { id: 3, name: "Sample Place 3", description: "This is a sample description for Place 3" }
                    ]
                };

                // 네트워크 지연을 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 모의 데이터를 실제 API 응답처럼 설정
                setData(mockData);
            } catch (error) {
                setIsError(true);
            }

            setIsLoading(false);
        };

        fetchData();
    }, [keyword]);

    return { data, isLoading, isError };
};

export default useFetchSearch;
