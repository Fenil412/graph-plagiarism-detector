import asyncio
from prisma import Prisma, Json
from datetime import datetime, timedelta
import random

async def main():
    db = Prisma()
    await db.connect()

    # Get a user, e.g., Fenil
    user = await db.user.find_first()
    if not user:
        print("No user found.")
        return
        
    documents = await db.document.find_many(where={"user_id": user.id})
    if len(documents) < 2:
        print("Not enough docs")
        # Let's create dummy docs
        doc_a = await db.document.create({
            "user_id": user.id,
            "file_name": "dummy_1.pdf",
            "original_name": "Project_Proposal.pdf",
            "mime_type": "application/pdf",
            "file_size": 1024,
            "content": "dummy",
            "word_count": 500,
            "status": "READY"
        })
        doc_b = await db.document.create({
            "user_id": user.id,
            "file_name": "dummy_2.pdf",
            "original_name": "Research_Paper.pdf",
            "mime_type": "application/pdf",
            "file_size": 2048,
            "content": "dummy 2",
            "word_count": 800,
            "status": "READY"
        })
        documents = [doc_a, doc_b]

    # Generate dummy comparisons
    for i in range(15):
        doc_a = random.choice(documents)
        doc_b = random.choice([d for d in documents if d.id != doc_a.id] or documents)
        
        sim_score = random.uniform(0.1, 0.95)
        
        comp = await db.comparison.create(data={
            "document_a_id": doc_a.id,
            "document_b_id": doc_b.id,
            "similarity_score": sim_score,
            "plagiarism_percentage": sim_score * 100,
            "algorithm_used": random.choice(["node_overlap", "edge_similarity", "subgraph"]),
            "status": "COMPLETED",
            "created_at": datetime.now() - timedelta(days=random.randint(0, 10))
        })
        
        await db.report.create(data={
            "comparison_id": comp.id,
            "report_data": Json({
                "dummy": True,
                "similarity_score": sim_score,
            })
        })
        print(f"Created comparison {comp.id} with score {sim_score*100:.2f}%")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
