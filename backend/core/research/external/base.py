from abc import ABC, abstractmethod


class ExternalProvider(ABC):
    name = 'base'

    @abstractmethod
    def search(self, query: str, top_k: int = 5, force: bool = False) -> list[dict]:
        ...
